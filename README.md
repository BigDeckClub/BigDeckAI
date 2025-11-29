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

- **Database**: PostgreSQL with UUID primary keys
- **Backend**: Node.js
- **Libraries**: pg (PostgreSQL client), dotenv, express
- **External API**: Scryfall API for card metadata

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bigdeckapp.git
   cd bigdeckapp
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

### Replit Setup

1. Fork this Repl
2. Add your `DATABASE_URL` to Replit Secrets
3. Run the project - migrations will run automatically

## Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Or using the script directly
node scripts/run-migrations.js
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

See [docs/DATABASE.md](docs/DATABASE.md) for detailed schema documentation.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run db:init` | Initialize database and run migrations |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:sync` | Sync cards from Scryfall |
| `npm run stock:check` | Check inventory stock alerts |

## Scryfall API Integration

The application integrates with [Scryfall API](https://scryfall.com/docs/api) for card data:

- Card images and metadata are fetched on-demand
- Automatic rate limiting (100ms between requests)
- Periodic sync for price updates

```bash
# Import cards by search query
node scripts/sync-scryfall.js search "lightning bolt"

# Sync stale card data
node scripts/sync-scryfall.js sync 24
```

## Card Variant Tracking

Each unique combination of card attributes creates a separate inventory item:
- Card + Condition + Foil status = Unique item
- Optional: Finish (etched, etc.) and Frame Effects

See [docs/CARD_VARIANTS.md](docs/CARD_VARIANTS.md) for details.

## License

MIT
