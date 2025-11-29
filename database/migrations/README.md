# Database Migrations

This directory contains SQL migration files for the BigDeckApp database schema.

## Migration System

Migrations are versioned SQL files that allow incremental database schema updates. Each migration is tracked in the `schema_migrations` table to ensure it's only run once.

## Naming Convention

Migration files follow this naming pattern:
```
{version}_{description}.sql
```

Examples:
- `001_initial_schema.sql`
- `002_add_wishlist_table.sql`
- `003_add_price_history.sql`

## Running Migrations

### Using the Migration Runner

```bash
node scripts/run-migrations.js
```

### Manual Execution

```bash
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
```

## Creating New Migrations

1. Create a new SQL file with the next version number
2. Include `CREATE TABLE IF NOT EXISTS` for idempotency
3. Add an `INSERT INTO schema_migrations` statement at the end
4. Test the migration locally before committing

## Migration Template

```sql
-- Migration: {version}_{description}
-- Description: {What this migration does}
-- Created: {date}

-- Your schema changes here
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns...
);

-- Record this migration
INSERT INTO schema_migrations (migration_name) VALUES ('{version}_{description}')
ON CONFLICT (migration_name) DO NOTHING;
```

## Existing Migrations

| Version | Description | Status |
|---------|-------------|--------|
| 001 | Initial schema with all core tables | ✅ |

## Rollback Strategy

Rollback scripts are not automatically generated. If you need to rollback:

1. Create a new migration that undoes the changes
2. Document the rollback procedure
3. Test thoroughly in a development environment

## Best Practices

- Always use `IF NOT EXISTS` / `IF EXISTS` for idempotent migrations
- Never modify a migration that has been applied to production
- Include comments explaining complex changes
- Test migrations on a copy of production data when possible
- Keep migrations small and focused on a single change
