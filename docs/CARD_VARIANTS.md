# Card Variant Tracking Guide

## Overview

BigDeckApp tracks card variants as separate inventory items. This means that each unique combination of attributes creates its own inventory record with its own quantity and value.

## Why Separate Items?

Different variants of the same card have different values:
- A foil Lightning Bolt is worth more than a non-foil
- A Near Mint card is worth more than Moderately Played
- An etched foil version has different value than regular foil

By tracking these separately, you can:
- Accurately track inventory value
- Know exactly what you have
- List specific variants for sale/trade
- Maintain proper quantity counts per variant

## Variant Attributes

### Required Differentiators

These fields are always considered when determining if an item is a unique variant:

| Field | Type | Description |
|-------|------|-------------|
| card_id | UUID | The specific card (set + collector number) |
| condition | VARCHAR(20) | Card condition |
| foil | BOOLEAN | Whether the card is foil |

### Condition Values

Standard condition grades:
- **NM** - Near Mint (like new)
- **LP** - Lightly Played (minor wear)
- **MP** - Moderately Played (noticeable wear)
- **HP** - Heavily Played (significant wear)
- **DMG** - Damaged (major damage)

### Optional Fields

These fields are **nullable** and only used when applicable:

| Field | Type | When to Use |
|-------|------|-------------|
| finish | VARCHAR(50) | For special finishes beyond regular foil |
| frame_effects | VARCHAR(100) | For special frame treatments |

#### Finish Examples
- `etched` - Etched foil (Commander Legends, etc.)
- `glossy` - Glossy finish
- `textured` - Textured foil (Secret Lair, etc.)

#### Frame Effects Examples
- `showcase` - Showcase frame
- `borderless` - Borderless art
- `extendedart` - Extended art
- `retro` - Retro frame
- `inverted` - Inverted frame

## Examples

### Example 1: Standard Card Variants

You have 4 copies of Lightning Bolt from M11:
- 2x Non-foil, Near Mint
- 1x Foil, Near Mint  
- 1x Non-foil, Lightly Played

This creates **3 inventory items**:

| card_id | condition | foil | quantity |
|---------|-----------|------|----------|
| m11-bolt | NM | false | 2 |
| m11-bolt | NM | true | 1 |
| m11-bolt | LP | false | 1 |

### Example 2: Special Finishes

You have showcase versions of a card:
- 1x Showcase frame, etched foil
- 2x Regular frame, regular foil

This creates **2 inventory items**:

| card_id | foil | finish | frame_effects | quantity |
|---------|------|--------|---------------|----------|
| card-123 | true | etched | showcase | 1 |
| card-456 | true | NULL | NULL | 2 |

Note: The showcase etched version uses a **different Scryfall ID** (card-123) because it's a different printing.

### Example 3: When NOT to Use Optional Fields

Regular cards should have `NULL` for optional fields:

```sql
INSERT INTO inventory_items (
  card_id, user_id, quantity, condition, foil,
  finish, frame_effects  -- Both NULL for regular cards
) VALUES (
  'card-uuid', 'user-uuid', 4, 'NM', false,
  NULL, NULL
);
```

Don't set these to empty string or 'none' - use `NULL`.

## Adding Cards to Inventory

### Best Practice: Check for Existing Variants

Before adding cards, check if a matching variant exists:

```sql
-- Check for existing variant
SELECT * FROM inventory_items
WHERE card_id = 'card-uuid'
  AND user_id = 'user-uuid'
  AND condition = 'NM'
  AND foil = false
  AND finish IS NULL
  AND frame_effects IS NULL;
```

If found, update the quantity. If not, create a new item.

### Using the Composite Index

The database includes a composite index for efficient variant lookups:

```sql
CREATE INDEX idx_inventory_variants 
ON inventory_items(card_id, condition, foil, finish, frame_effects);
```

## Price Tracking

Each inventory item can track purchase information:

| Field | Description |
|-------|-------------|
| purchase_price | Price paid per card |
| purchase_source | Where you bought it |
| purchase_date | When you bought it |

Example:
```sql
UPDATE inventory_items
SET purchase_price = 15.00,
    purchase_source = 'Local Game Store',
    purchase_date = '2024-01-15'
WHERE id = 'item-uuid';
```

## Common Patterns

### Merge Duplicates
If you accidentally created duplicate variants:

```sql
-- Find duplicates
SELECT card_id, condition, foil, finish, frame_effects, COUNT(*), SUM(quantity)
FROM inventory_items
WHERE user_id = 'user-uuid'
GROUP BY card_id, condition, foil, finish, frame_effects
HAVING COUNT(*) > 1;

-- Then manually merge by updating one and deleting others
```

### Split Stack
To split a stack (e.g., sell 2 of 4 copies):

```sql
-- Reduce original
UPDATE inventory_items SET quantity = 2 WHERE id = 'item-uuid';

-- The transaction trigger will log this automatically
```

### Track Language Variants
The `language` field defaults to 'en' but can track foreign prints:

```sql
INSERT INTO inventory_items (card_id, user_id, quantity, condition, foil, language)
VALUES ('card-uuid', 'user-uuid', 1, 'NM', false, 'ja');  -- Japanese
```

## Summary

1. **Each unique variant is a separate inventory item**
2. **Required differentiators**: card_id, condition, foil
3. **Optional fields**: finish, frame_effects (use NULL when not applicable)
4. **Different printings** (showcase, borderless) typically have different Scryfall IDs
5. **Check for existing variants** before creating new items
