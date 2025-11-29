# Database Documentation

## Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────┐
│      users       │     │    categories    │
├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │
│ username         │     │ name             │
│ email            │     │ description      │
│ password_hash    │     │ minimum_stock    │
│ created_at       │     │ color            │
│ updated_at       │     │ created_at       │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │ 1:N                    │ 1:N
         │                        │
┌────────▼─────────┐     ┌────────▼─────────┐
│    locations     │     │ inventory_items  │◄────────────────┐
├──────────────────┤     ├──────────────────┤                 │
│ id (PK)          │     │ id (PK)          │                 │
│ user_id (FK)     │     │ card_id (FK)     │──────┐          │
│ name             │     │ user_id (FK)     │      │          │
│ description      │     │ location_id (FK) │      │          │
│ location_type    │     │ category_id (FK) │      │          │
│ parent_location  │     │ quantity         │      │          │
│ created_at       │     │ condition        │      │          │
│ updated_at       │     │ language         │      │          │
└──────────────────┘     │ foil             │      │          │
                         │ finish           │      │          │
┌──────────────────┐     │ frame_effects    │      │          │
│      cards       │     │ signed           │      │          │
├──────────────────┤     │ altered          │      │          │
│ id (PK)          │◄────┤ purchase_price   │      │          │
│ scryfall_id      │     │ purchase_source  │      │          │
│ oracle_id        │     │ purchase_date    │      │          │
│ name             │     │ notes            │      │          │
│ set_code         │     │ created_at       │      │          │
│ collector_number │     │ updated_at       │      │          │
│ rarity           │     └──────────────────┘      │          │
│ card_type        │                               │          │
│ mana_cost        │     ┌──────────────────┐      │          │
│ cmc              │     │   transactions   │      │          │
│ colors           │     ├──────────────────┤      │          │
│ image_uris       │     │ id (PK)          │      │          │
│ prices           │     │ inventory_item_id│──────┘          │
│ scryfall_uri     │     │ user_id (FK)     │                 │
│ last_synced_at   │     │ transaction_type │                 │
│ created_at       │     │ quantity_change  │                 │
└──────────────────┘     │ quantity_before  │                 │
                         │ quantity_after   │                 │
┌──────────────────┐     │ from_location_id │                 │
│      trades      │     │ to_location_id   │                 │
├──────────────────┤     │ related_trade_id │                 │
│ id (PK)          │     │ notes            │                 │
│ initiator_id(FK) │     │ transaction_date │                 │
│ recipient_id(FK) │     └──────────────────┘                 │
│ status           │                                          │
│ initiated_at     │     ┌──────────────────┐                 │
│ completed_at     │     │   trade_items    │                 │
│ notes            │     ├──────────────────┤                 │
└────────┬─────────┘     │ id (PK)          │                 │
         │               │ trade_id (FK)    │─────────────────┤
         └───────────────┤ inventory_item_id│─────────────────┘
                         │ from_user_id(FK) │
                         │ to_user_id (FK)  │
                         │ quantity         │
                         │ created_at       │
                         └──────────────────┘
```

## Table Descriptions

### users
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | VARCHAR(255) | Unique username |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Hashed password |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time (auto-updated) |

### categories
Predefined categories for organizing cards.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Category name (unique) |
| description | TEXT | Category description |
| minimum_stock_level | INTEGER | Alert threshold (default: 0) |
| color | VARCHAR(50) | Display color (hex) |
| created_at | TIMESTAMP | Creation time |

**Default Categories**: Lands, Common, Uncommon, Rare, Mythic, Bulk, Token, Basic Land, Special

### locations
Physical storage locations for cards.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (FK → users) |
| name | VARCHAR(255) | Location name |
| description | TEXT | Location description |
| location_type | VARCHAR(50) | Type (binder, box, deck, etc.) |
| parent_location_id | UUID | Parent location (self-reference) |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time (auto-updated) |

### cards
Card metadata from Scryfall API.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| scryfall_id | UUID | Scryfall's unique card ID |
| oracle_id | UUID | Oracle ID for card identity |
| name | VARCHAR(255) | Card name |
| set_code | VARCHAR(10) | Set code (e.g., "MH3") |
| collector_number | VARCHAR(20) | Collector number |
| rarity | VARCHAR(20) | common/uncommon/rare/mythic |
| card_type | VARCHAR(255) | Type line |
| mana_cost | VARCHAR(100) | Mana cost string |
| cmc | DECIMAL(10,2) | Converted mana cost |
| colors | TEXT[] | Array of colors |
| image_uris | JSONB | Image URLs from Scryfall |
| prices | JSONB | Price data from Scryfall |
| scryfall_uri | VARCHAR(500) | Link to Scryfall page |
| last_synced_at | TIMESTAMP | Last sync from Scryfall |
| created_at | TIMESTAMP | Creation time |

### inventory_items
User's card inventory with variant tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| card_id | UUID | Card reference (FK → cards) |
| user_id | UUID | Owner (FK → users) |
| location_id | UUID | Storage location (FK → locations) |
| category_id | UUID | Category (FK → categories) |
| quantity | INTEGER | Number of copies (≥ 0) |
| condition | VARCHAR(20) | NM, LP, MP, HP, DMG |
| language | VARCHAR(10) | Language code (default: 'en') |
| foil | BOOLEAN | Is foil (default: false) |
| finish | VARCHAR(50) | Special finish (optional) |
| frame_effects | VARCHAR(100) | Frame effects (optional) |
| signed | BOOLEAN | Is signed (default: false) |
| altered | BOOLEAN | Is altered (default: false) |
| purchase_price | DECIMAL(10,2) | Purchase price per card |
| purchase_source | VARCHAR(255) | Where purchased |
| purchase_date | DATE | When purchased |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update (auto-updated) |

### transactions
Audit trail of all inventory changes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| inventory_item_id | UUID | Item changed (FK → inventory_items) |
| user_id | UUID | User who made change (FK → users) |
| transaction_type | VARCHAR(20) | ADD, REMOVE, MOVE, DELETE |
| quantity_change | INTEGER | Amount changed |
| quantity_before | INTEGER | Previous quantity |
| quantity_after | INTEGER | New quantity |
| from_location_id | UUID | Source location (FK → locations) |
| to_location_id | UUID | Destination location (FK → locations) |
| related_trade_id | UUID | Related trade (FK → trades) |
| notes | TEXT | Transaction notes |
| transaction_date | TIMESTAMP | When occurred |

### trades
Trade records between users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| initiator_user_id | UUID | Trade initiator (FK → users) |
| recipient_user_id | UUID | Trade recipient (FK → users) |
| status | VARCHAR(20) | pending/accepted/rejected/completed |
| initiated_at | TIMESTAMP | When trade started |
| completed_at | TIMESTAMP | When trade completed |
| notes | TEXT | Trade notes |

### trade_items
Individual items in a trade.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| trade_id | UUID | Parent trade (FK → trades) |
| inventory_item_id | UUID | Item being traded (FK → inventory_items) |
| from_user_id | UUID | Item source (FK → users) |
| to_user_id | UUID | Item destination (FK → users) |
| quantity | INTEGER | Number of cards (> 0) |
| created_at | TIMESTAMP | Creation time |

## Example Queries

### Get all cards in a user's inventory
```sql
SELECT 
  c.name, c.set_code, c.rarity,
  i.quantity, i.condition, i.foil,
  l.name as location
FROM inventory_items i
JOIN cards c ON i.card_id = c.id
LEFT JOIN locations l ON i.location_id = l.id
WHERE i.user_id = 'user-uuid-here'
ORDER BY c.name;
```

### Get inventory value by category
```sql
SELECT 
  cat.name as category,
  SUM(i.quantity) as total_cards,
  SUM(i.quantity * COALESCE(i.purchase_price, 0)) as total_value
FROM inventory_items i
JOIN categories cat ON i.category_id = cat.id
WHERE i.user_id = 'user-uuid-here'
GROUP BY cat.name
ORDER BY total_value DESC;
```

### Get transaction history for a card
```sql
SELECT 
  t.transaction_type,
  t.quantity_change,
  t.quantity_before,
  t.quantity_after,
  t.transaction_date,
  fl.name as from_location,
  tl.name as to_location
FROM transactions t
LEFT JOIN locations fl ON t.from_location_id = fl.id
LEFT JOIN locations tl ON t.to_location_id = tl.id
WHERE t.inventory_item_id = 'item-uuid-here'
ORDER BY t.transaction_date DESC;
```

### Find all foil versions of a card
```sql
SELECT 
  c.name, c.set_code, c.collector_number,
  i.condition, i.quantity, i.purchase_price
FROM inventory_items i
JOIN cards c ON i.card_id = c.id
WHERE c.name ILIKE '%Lightning Bolt%'
  AND i.foil = true
  AND i.user_id = 'user-uuid-here';
```

### Low stock alert query
```sql
SELECT 
  cat.name,
  cat.minimum_stock_level,
  COALESCE(SUM(i.quantity), 0) as current_stock
FROM categories cat
LEFT JOIN inventory_items i ON i.category_id = cat.id
WHERE cat.minimum_stock_level > 0
GROUP BY cat.id, cat.name, cat.minimum_stock_level
HAVING COALESCE(SUM(i.quantity), 0) < cat.minimum_stock_level;
```

## Indexes

The following indexes are created for query performance:

| Table | Index | Columns |
|-------|-------|---------|
| cards | idx_cards_scryfall_id | scryfall_id |
| cards | idx_cards_oracle_id | oracle_id |
| cards | idx_cards_name | name |
| cards | idx_cards_set_code | set_code |
| inventory_items | idx_inventory_card_id | card_id |
| inventory_items | idx_inventory_user_id | user_id |
| inventory_items | idx_inventory_location_id | location_id |
| inventory_items | idx_inventory_category_id | category_id |
| inventory_items | idx_inventory_variants | card_id, condition, foil, finish, frame_effects |
| transactions | idx_transactions_item_id | inventory_item_id |
| transactions | idx_transactions_user_id | user_id |
| transactions | idx_transactions_type | transaction_type |
| transactions | idx_transactions_date | transaction_date |
| trades | idx_trades_initiator | initiator_user_id |
| trades | idx_trades_recipient | recipient_user_id |
| trades | idx_trades_status | status |

## Triggers

### Auto-update timestamps
- `update_users_updated_at` - Updates `updated_at` on users table
- `update_locations_updated_at` - Updates `updated_at` on locations table
- `update_inventory_items_updated_at` - Updates `updated_at` on inventory_items table

### Transaction logging
- `log_inventory_changes` - Automatically creates transaction records when inventory quantities change
- `log_inventory_location_moves` - Logs when items are moved between locations
