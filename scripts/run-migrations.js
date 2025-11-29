#!/usr/bin/env node
/**
 * BigDeckApp Migration Runner
 * Runs SQL migrations in order, tracking which have been applied
 *
 * @module scripts/run-migrations
 * @description CLI tool for database migrations with support for dry-run mode,
 * rollback capability, and detailed migration tracking.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');
const ROLLBACK_DIR = path.join(__dirname, '..', 'database', 'rollbacks');

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a formatted timestamp string
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format duration in milliseconds to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Create a horizontal separator line
 * @param {number} width - Line width
 * @returns {string} Separator line
 */
function separator(width = 60) {
  return '─'.repeat(width);
}

/**
 * Log with timestamp
 * @param {string} level - Log level (INFO, WARN, ERROR)
 * @param {string} message - Log message
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = {
    INFO: 'ℹ️ ',
    WARN: '⚠️ ',
    ERROR: '❌',
    SUCCESS: '✅',
  };
  console.log(`[${timestamp}] ${prefix[level] || ''} ${message}`);
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Create database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT, 10) || 5000,
  });
}

/**
 * Ensure the schema_migrations table exists with proper schema
 * @param {Pool} pool - Database connection pool
 */
async function ensureMigrationsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW(),
      execution_time_ms INTEGER,
      checksum VARCHAR(64),
      applied_by VARCHAR(255) DEFAULT 'migration-runner'
    )
  `);
}

/**
 * Check if a migration has been applied
 * @param {Pool} pool - Database connection pool
 * @param {string} migrationName - Migration name
 * @returns {Promise<boolean>} True if migration is applied
 */
async function isMigrationApplied(pool, migrationName) {
  try {
    const result = await pool.query('SELECT 1 FROM schema_migrations WHERE migration_name = $1', [migrationName]);
    return result.rows.length > 0;
  } catch (err) {
    // Table might not exist yet
    if (err.message.includes('does not exist')) {
      return false;
    }
    throw err;
  }
}

/**
 * Record a migration as applied
 * @param {Pool} pool - Database connection pool
 * @param {string} migrationName - Migration name
 * @param {number} executionTime - Execution time in milliseconds
 * @param {string} checksum - File checksum
 */
async function recordMigration(pool, migrationName, executionTime, checksum) {
  await pool.query(
    `INSERT INTO schema_migrations (migration_name, execution_time_ms, checksum) 
     VALUES ($1, $2, $3)
     ON CONFLICT (migration_name) DO UPDATE SET
       applied_at = NOW(),
       execution_time_ms = EXCLUDED.execution_time_ms,
       checksum = EXCLUDED.checksum`,
    [migrationName, executionTime, checksum]
  );
}

/**
 * Remove a migration record (for rollback)
 * @param {Pool} pool - Database connection pool
 * @param {string} migrationName - Migration name
 */
async function removeMigrationRecord(pool, migrationName) {
  await pool.query('DELETE FROM schema_migrations WHERE migration_name = $1', [migrationName]);
}

/**
 * Get list of applied migrations
 * @param {Pool} pool - Database connection pool
 * @returns {Promise<Array>} Array of applied migrations
 */
async function getAppliedMigrations(pool) {
  try {
    const result = await pool.query(`
      SELECT migration_name, applied_at, execution_time_ms, checksum
      FROM schema_migrations
      ORDER BY migration_name ASC
    `);
    return result.rows;
  } catch (err) {
    if (err.message.includes('does not exist')) {
      return [];
    }
    throw err;
  }
}

/**
 * Calculate simple checksum for a string
 * @param {string} content - Content to checksum
 * @returns {string} Checksum string
 */
function calculateChecksum(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// =============================================================================
// MIGRATION OPERATIONS
// =============================================================================

/**
 * Get list of migration files
 * @returns {Array<string>} Sorted array of migration file names
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.startsWith('_'))
    .sort();
}

/**
 * Get list of rollback files
 * @returns {Array<string>} Sorted array of rollback file names
 */
function getRollbackFiles() {
  if (!fs.existsSync(ROLLBACK_DIR)) {
    return [];
  }

  return fs
    .readdirSync(ROLLBACK_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

/**
 * Run a single migration
 * @param {Pool} pool - Database connection pool
 * @param {string} file - Migration file name
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - If true, don't actually apply migration
 * @returns {Promise<Object>} Migration result
 */
async function runMigration(pool, file, options = {}) {
  const { dryRun = false } = options;
  const migrationName = file.replace('.sql', '');
  const filePath = path.join(MIGRATIONS_DIR, file);
  const sql = fs.readFileSync(filePath, 'utf8');
  const checksum = calculateChecksum(sql);

  const result = {
    name: migrationName,
    file,
    status: 'pending',
    duration: 0,
    checksum,
    error: null,
  };

  if (dryRun) {
    result.status = 'dry-run';
    log('INFO', `[DRY RUN] Would apply: ${file}`);
    return result;
  }

  const startTime = Date.now();

  try {
    await pool.query(sql);
    const duration = Date.now() - startTime;

    // Record the migration
    await recordMigration(pool, migrationName, duration, checksum);

    result.status = 'applied';
    result.duration = duration;

    log('SUCCESS', `Applied: ${file} (${formatDuration(duration)})`);
  } catch (err) {
    result.status = 'failed';
    result.error = err.message;
    result.duration = Date.now() - startTime;

    log('ERROR', `Failed to apply ${file}: ${err.message}`);
    throw err;
  }

  return result;
}

/**
 * Run a rollback for a migration
 * @param {Pool} pool - Database connection pool
 * @param {string} migrationName - Migration name to rollback
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - If true, don't actually rollback
 * @returns {Promise<Object>} Rollback result
 */
async function runRollback(pool, migrationName, options = {}) {
  const { dryRun = false } = options;
  const rollbackFile = `${migrationName}_rollback.sql`;
  const rollbackPath = path.join(ROLLBACK_DIR, rollbackFile);

  const result = {
    name: migrationName,
    status: 'pending',
    duration: 0,
    error: null,
  };

  // Check if rollback file exists
  if (!fs.existsSync(rollbackPath)) {
    result.status = 'no-rollback';
    result.error = `No rollback file found: ${rollbackFile}`;
    log('WARN', `No rollback file for ${migrationName}`);
    return result;
  }

  const sql = fs.readFileSync(rollbackPath, 'utf8');

  if (dryRun) {
    result.status = 'dry-run';
    log('INFO', `[DRY RUN] Would rollback: ${migrationName}`);
    return result;
  }

  const startTime = Date.now();

  try {
    await pool.query(sql);
    const duration = Date.now() - startTime;

    // Remove migration record
    await removeMigrationRecord(pool, migrationName);

    result.status = 'rolled-back';
    result.duration = duration;

    log('SUCCESS', `Rolled back: ${migrationName} (${formatDuration(duration)})`);
  } catch (err) {
    result.status = 'failed';
    result.error = err.message;
    result.duration = Date.now() - startTime;

    log('ERROR', `Failed to rollback ${migrationName}: ${err.message}`);
    throw err;
  }

  return result;
}

// =============================================================================
// CLI COMMANDS
// =============================================================================

/**
 * Run all pending migrations
 * @param {Pool} pool - Database connection pool
 * @param {Object} options - Options
 */
async function runAllMigrations(pool, options = {}) {
  const { dryRun = false } = options;

  await ensureMigrationsTable(pool);

  const files = getMigrationFiles();

  if (files.length === 0) {
    log('INFO', 'No migration files found');
    return;
  }

  console.log(`\nFound ${files.length} migration file(s):\n`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  const results = [];
  let appliedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const migrationName = file.replace('.sql', '');

    // Check if already applied
    const isApplied = await isMigrationApplied(pool, migrationName);

    if (isApplied) {
      log('INFO', `⏭️  Skipping (already applied): ${file}`);
      skippedCount++;
      continue;
    }

    const result = await runMigration(pool, file, { dryRun });
    results.push(result);

    if (result.status === 'applied' || result.status === 'dry-run') {
      appliedCount++;
    }
  }

  console.log('\n' + separator());
  console.log(`\n📊 Summary:`);
  console.log(`   Applied: ${appliedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  if (dryRun) {
    console.log(`   (Dry run - no changes made)`);
  }
  console.log('');
}

/**
 * Show migration status
 * @param {Pool} pool - Database connection pool
 */
async function showStatus(pool) {
  await ensureMigrationsTable(pool);

  const files = getMigrationFiles();
  const applied = await getAppliedMigrations(pool);
  const appliedNames = new Set(applied.map((m) => m.migration_name));

  console.log('\n📋 Migration Status\n');
  console.log(separator());

  if (files.length === 0) {
    console.log('\nNo migration files found\n');
    return;
  }

  console.log('\n');

  for (const file of files) {
    const migrationName = file.replace('.sql', '');
    const isApplied = appliedNames.has(migrationName);
    const appliedInfo = applied.find((m) => m.migration_name === migrationName);

    if (isApplied) {
      const appliedAt = new Date(appliedInfo.applied_at).toLocaleString();
      const duration = appliedInfo.execution_time_ms ? formatDuration(appliedInfo.execution_time_ms) : 'N/A';
      console.log(`  ✅ ${file}`);
      console.log(`     Applied: ${appliedAt} | Duration: ${duration}`);
    } else {
      console.log(`  ⬜ ${file}`);
      console.log(`     Pending`);
    }
    console.log('');
  }

  const pendingCount = files.length - appliedNames.size;
  console.log(separator());
  console.log(`\nTotal: ${files.length} | Applied: ${appliedNames.size} | Pending: ${pendingCount}\n`);
}

/**
 * Rollback the last migration
 * @param {Pool} pool - Database connection pool
 * @param {Object} options - Options
 */
async function rollbackLast(pool, options = {}) {
  const { dryRun = false } = options;

  const applied = await getAppliedMigrations(pool);

  if (applied.length === 0) {
    log('INFO', 'No migrations to rollback');
    return;
  }

  // Get the last applied migration
  const lastMigration = applied[applied.length - 1];
  log('INFO', `Rolling back: ${lastMigration.migration_name}`);

  await runRollback(pool, lastMigration.migration_name, { dryRun });
}

/**
 * Rollback to a specific migration
 * @param {Pool} pool - Database connection pool
 * @param {string} targetMigration - Migration name to rollback to
 * @param {Object} options - Options
 */
async function rollbackTo(pool, targetMigration, options = {}) {
  const { dryRun = false } = options;

  const applied = await getAppliedMigrations(pool);
  const targetIndex = applied.findIndex((m) => m.migration_name === targetMigration);

  if (targetIndex === -1) {
    log('ERROR', `Migration not found: ${targetMigration}`);
    return;
  }

  // Rollback all migrations after the target (in reverse order)
  const toRollback = applied.slice(targetIndex + 1).reverse();

  if (toRollback.length === 0) {
    log('INFO', 'No migrations to rollback');
    return;
  }

  console.log(`\nWill rollback ${toRollback.length} migration(s):\n`);
  toRollback.forEach((m) => console.log(`  - ${m.migration_name}`));
  console.log('');

  for (const migration of toRollback) {
    await runRollback(pool, migration.migration_name, { dryRun });
  }
}

/**
 * Print help message
 */
function printHelp() {
  console.log('Usage:');
  console.log('  node run-migrations.js [command] [options]');
  console.log('');
  console.log('Commands:');
  console.log('  run              Run all pending migrations (default)');
  console.log('  status           Show migration status');
  console.log('  rollback         Rollback the last migration');
  console.log('  rollback-to <n>  Rollback to a specific migration');
  console.log('  help             Show this help message');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run        Show what would be done without making changes');
  console.log('');
  console.log('Examples:');
  console.log('  node run-migrations.js                       # Run all pending migrations');
  console.log('  node run-migrations.js --dry-run             # Preview migrations');
  console.log('  node run-migrations.js status                # Show status');
  console.log('  node run-migrations.js rollback              # Rollback last migration');
  console.log('  node run-migrations.js rollback --dry-run    # Preview rollback');
  console.log('  node run-migrations.js rollback-to 001_init  # Rollback to specific migration');
  console.log('');
  console.log('Environment Variables:');
  console.log('  DATABASE_URL                 PostgreSQL connection string (required)');
  console.log('  DATABASE_SSL                 Enable SSL (true/false)');
  console.log('  DATABASE_CONNECTION_TIMEOUT  Connection timeout in ms');
  console.log('');
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args.find((arg) => !arg.startsWith('--')) || 'run';
  const dryRun = args.includes('--dry-run');

  console.log('🔄 BigDeckApp Migration Runner');
  console.log('==============================\n');

  // Handle help command before checking for DATABASE_URL
  if (command === 'help' || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    log('ERROR', 'DATABASE_URL environment variable is not set');
    console.log('\nPlease set DATABASE_URL in your .env file or Replit secrets');
    process.exit(1);
  }

  const pool = createPool();

  try {
    // Test connection
    await pool.query('SELECT 1');
    log('SUCCESS', 'Connected to database\n');

    switch (command) {
      case 'run':
        await runAllMigrations(pool, { dryRun });
        break;

      case 'status':
        await showStatus(pool);
        break;

      case 'rollback':
        await rollbackLast(pool, { dryRun });
        break;

      case 'rollback-to': {
        const targetMigration = args[args.indexOf('rollback-to') + 1];
        if (!targetMigration) {
          log('ERROR', 'Please specify a migration name');
          console.log('Usage: node run-migrations.js rollback-to <migration-name>');
          process.exit(1);
        }
        await rollbackTo(pool, targetMigration, { dryRun });
        break;
      }

      default:
        log('ERROR', `Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }

    if (!dryRun && ['run', 'rollback', 'rollback-to'].includes(command)) {
      console.log('🎉 Migration operation completed successfully!\n');
    }
  } catch (error) {
    log('ERROR', `Migration failed: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  createPool,
  getMigrationFiles,
  getAppliedMigrations,
  runMigration,
  runRollback,
  calculateChecksum,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
