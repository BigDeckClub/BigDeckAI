# BigDeckApp

A Magic: The Gathering card inventory tracking application built with PostgreSQL and Node.js.

## Features

- **Card Management**: Track your MTG card collection with detailed metadata from Scryfall
- **Variant Tracking**: Separate tracking for foil/non-foil, conditions, and special finishes
- **Location Management**: Organize cards by physical locations (binders, boxes, decks)
- **Category System**: Categorize cards (Lands, Common, Uncommon, Rare, Mythic, etc.)
- **Transaction History**: Complete audit trail of all inventory changes
- **Trade System**: Built-in support for tracking trades between users
- **Stock Alerts**: Monitor inventory levels against minimum thresholds
- **Scryfall Integration**: Automatic card data synchronization from Scryfall API

## Tech Stack

- **Runtime**: Node.js 18+ (optimized for Node.js 20)
- **Database**: PostgreSQL with UUID primary keys
- **Framework**: Express.js
- **Libraries**: pg (PostgreSQL client), dotenv
- **External API**: Scryfall API for card metadata

## Quick Start

### Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BigDeckClub/BigDeckApp.git
   cd BigDeckApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Initialize the database:
   ```bash
   npm run db:init
   ```

5. Start the application:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

## Replit Setup

### Quick Setup

1. Fork this Repl or import from GitHub
2. Add your `DATABASE_URL` to Replit Secrets (Tools > Secrets)
3. Click Run - the application will start automatically

### Detailed Replit Configuration

#### Required Secrets

Add these in the **Secrets** tab (Tools > Secrets):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DATABASE_SSL` | Enable SSL for database | `true` |

#### Recommended Database Providers for Replit

1. **[Neon](https://neon.tech)** (Recommended)
   - Free tier available
   - Serverless PostgreSQL
   - Connection string format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

2. **[Supabase](https://supabase.com)**
   - Free tier available
   - Full PostgreSQL with extras
   - Connection string format: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

3. **[Railway](https://railway.app)**
   - Easy PostgreSQL setup
   - Free tier with limitations

#### SSL Configuration

For cloud databases, set these secrets:
```
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

For local development or self-signed certificates:
```
DATABASE_SSL=false
```

### First Run on Replit

After configuring secrets:

1. Click the **Run** button
2. Migrations will run automatically on first start
3. Access your app at the provided Replit URL
4. Check health at `/health` endpoint

## Environment Variables

See `.env.example` for all available configuration options:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection URL |
| `DATABASE_SSL` | No | `false` | Enable SSL for database |
| `DATABASE_POOL_MAX` | No | `10` | Max database connections |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `LOG_REQUESTS` | No | `true` | Enable request logging |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Rate limit per minute |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and available endpoints |
| `/health` | GET | Basic health check |
| `/health/detailed` | GET | Detailed health with database info |
| `/api/docs` | GET | API documentation |

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the application |
| `npm run dev` | Start with auto-reload (development) |
| `npm run db:init` | Initialize database and run migrations |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:migrate:status` | Show migration status |
| `npm run db:migrate:rollback` | Rollback last migration |
| `npm run db:migrate:dry-run` | Preview migrations without applying |
| `npm run db:sync` | Sync cards from Scryfall |
| `npm run stock:check` | Check inventory stock alerts |
| `npm run health` | Check server health (requires curl) |

## Database Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
npm run db:migrate:status

# Preview what migrations would run
npm run db:migrate:dry-run

# Rollback the last migration
npm run db:migrate:rollback
```

## Scryfall API Integration

The application integrates with [Scryfall API](https://scryfall.com/docs/api) for card data:

```bash
# Import cards by search query
node scripts/sync-scryfall.js search "lightning bolt"

# Import mythic cards from a set
node scripts/sync-scryfall.js search "set:mh3 rarity:mythic"

# Sync stale card data (older than 24 hours)
node scripts/sync-scryfall.js sync 24

# Sync with custom limit
node scripts/sync-scryfall.js sync 48 50

# Get a specific card by Scryfall ID
node scripts/sync-scryfall.js card "3b3e3535-5e86-4dc2-a7a5-f0379a4a1b92"
```

## Stock Alerts

Check inventory levels against minimum thresholds:

```bash
# Check stock alerts
node scripts/check-stock-alerts.js check <user-id>

# Export alerts to CSV
node scripts/check-stock-alerts.js check <user-id> --csv > alerts.csv

# List low stock items
node scripts/check-stock-alerts.js low <user-id> 5

# Show inventory statistics
node scripts/check-stock-alerts.js stats <user-id>

# Show category summary
node scripts/check-stock-alerts.js summary <user-id>
```

## Database Schema

The application uses the following main tables:

| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `categories` | Card categories (Lands, Common, Rare, etc.) |
| `locations` | Physical storage locations |
| `cards` | Card metadata from Scryfall |
| `inventory_items` | User's card inventory with variants |
| `transactions` | Inventory change history |
| `trades` | Trade records between users |
| `trade_items` | Items in each trade |
| `schema_migrations` | Migration tracking |

See [docs/DATABASE.md](docs/DATABASE.md) for detailed schema documentation.

## Troubleshooting

### Common Issues on Replit

#### "Connection refused" or "ECONNREFUSED"
- Verify `DATABASE_URL` is correctly set in Secrets
- Check if your database provider is accessible from Replit
- Ensure SSL settings match your provider's requirements

#### "SSL required" or SSL errors
- Set `DATABASE_SSL=true` in Secrets
- For self-signed certificates, set `DATABASE_SSL_REJECT_UNAUTHORIZED=false`

#### "Connection timeout"
- Increase `DATABASE_CONNECTION_TIMEOUT` to `10000` (10 seconds)
- Check if your database provider allows connections from Replit's IP range

#### Migrations fail on first run
- Ensure the database user has CREATE TABLE permissions
- Check if the database exists
- Verify the connection string includes the correct database name

#### Application crashes on startup
- Check the Replit console for error messages
- Verify all required secrets are set
- Try running `npm install` in the Shell

### General Troubleshooting

#### Database connection issues
```bash
# Test connection manually
node -e "require('dotenv').config(); const {Pool} = require('pg'); new Pool({connectionString: process.env.DATABASE_URL}).query('SELECT 1').then(() => console.log('OK')).catch(e => console.error(e.message))"
```

#### Check health endpoint
```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/detailed
```

#### View migration status
```bash
npm run db:migrate:status
```

### Getting Help

1. Check the [docs/](docs/) folder for detailed documentation
2. Review `.env.example` for configuration options
3. Open an issue on GitHub for bugs or feature requests

## Card Variant Tracking

Each unique combination of card attributes creates a separate inventory item:
- Card + Condition + Foil status = Unique item
- Optional: Finish (etched, etc.) and Frame Effects

See [docs/CARD_VARIANTS.md](docs/CARD_VARIANTS.md) for details.

## License

MIT
