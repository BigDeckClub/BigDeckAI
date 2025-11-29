#!/bin/bash
# BigDeckApp Database Initialization Script
# This script initializes the PostgreSQL database for Replit

set -e

echo "🎴 BigDeckApp Database Initialization"
echo "======================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL in your .env file or Replit secrets"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql command not found"
  echo "Please ensure PostgreSQL is installed"
  exit 1
fi

echo "✅ PostgreSQL client is available"

# Test database connection
echo ""
echo "Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Failed to connect to database"
  echo "Please check your DATABASE_URL"
  exit 1
fi

# Check if migrations have been run
echo ""
echo "Checking migration status..."
MIGRATION_TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schema_migrations');" 2>/dev/null | tr -d '[:space:]')

if [ "$MIGRATION_TABLE_EXISTS" = "t" ]; then
  echo "✅ Migrations table exists"
  
  # Check if initial migration has been run
  INITIAL_MIGRATION=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '001_initial_schema';" 2>/dev/null | tr -d '[:space:]')
  
  if [ "$INITIAL_MIGRATION" = "1" ]; then
    echo "✅ Initial schema migration already applied"
    echo ""
    echo "Database is already initialized!"
    exit 0
  fi
fi

# Run migrations
echo ""
echo "Running database migrations..."
node scripts/run-migrations.js

echo ""
echo "🎉 Database initialization complete!"
echo ""
echo "Next steps:"
echo "  1. Start the application: npm start"
echo "  2. Or run in development mode: npm run dev"
