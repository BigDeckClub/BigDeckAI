#!/usr/bin/env node
/**
 * BigDeckApp Migration Runner
 * Runs SQL migrations in order, tracking which have been applied
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');

async function main() {
  console.log('🔄 BigDeckApp Migration Runner');
  console.log('==============================\n');

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to database\n');

    // Get list of migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    console.log(`Found ${files.length} migration file(s):\n`);
    files.forEach(f => console.log(`  - ${f}`));
    console.log('');

    // Run each migration
    for (const file of files) {
      const migrationName = file.replace('.sql', '');
      const filePath = path.join(MIGRATIONS_DIR, file);

      console.log(`Processing: ${file}`);

      // Check if migration has already been applied
      try {
        const result = await pool.query(
          'SELECT 1 FROM schema_migrations WHERE migration_name = $1',
          [migrationName]
        );

        if (result.rows.length > 0) {
          console.log(`  ⏭️  Already applied, skipping\n`);
          continue;
        }
      } catch (err) {
        // Table might not exist yet, which is fine for the first migration
        if (!err.message.includes('does not exist')) {
          throw err;
        }
      }

      // Read and execute migration
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`  ✅ Applied successfully\n`);
      } catch (err) {
        console.error(`  ❌ Failed to apply migration: ${err.message}`);
        throw err;
      }
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
