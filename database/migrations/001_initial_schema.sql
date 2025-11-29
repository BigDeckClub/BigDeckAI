-- Migration: 001_initial_schema
-- Description: Initial database schema for BigDeckApp
-- Created: 2024-01-01

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  minimum_stock_level INTEGER DEFAULT 0,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_type VARCHAR(50),
  parent_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scryfall_id UUID UNIQUE NOT NULL,
  oracle_id UUID,
  name VARCHAR(255) NOT NULL,
  set_code VARCHAR(10),
  collector_number VARCHAR(20),
  rarity VARCHAR(20),
  card_type VARCHAR(255),
  mana_cost VARCHAR(100),
  cmc DECIMAL(10,2),
  colors TEXT[],
  image_uris JSONB,
  prices JSONB,
  scryfall_uri VARCHAR(500),
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_scryfall_id ON cards(scryfall_id);
CREATE INDEX IF NOT EXISTS idx_cards_oracle_id ON cards(oracle_id);
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_set_code ON cards(set_code);

-- =====================================================
-- TRADES TABLE (Created before transactions due to FK)
-- =====================================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) NOT NULL,
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_trades_initiator ON trades(initiator_user_id);
CREATE INDEX IF NOT EXISTS idx_trades_recipient ON trades(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);

-- =====================================================
-- INVENTORY_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE RESTRICT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  condition VARCHAR(20),
  language VARCHAR(10) DEFAULT 'en',
  foil BOOLEAN DEFAULT false,
  finish VARCHAR(50),
  frame_effects VARCHAR(100),
  signed BOOLEAN DEFAULT false,
  altered BOOLEAN DEFAULT false,
  purchase_price DECIMAL(10,2),
  purchase_source VARCHAR(255),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_card_id ON inventory_items(card_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variants ON inventory_items(card_id, condition, foil, finish, frame_effects);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  quantity_change INTEGER,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  related_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  notes TEXT,
  transaction_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- =====================================================
-- TRADE_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trade_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MIGRATIONS TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to locations table
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to inventory_items table
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inventory transaction logging function
CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_quantity_before INTEGER;
  v_quantity_after INTEGER;
  v_quantity_change INTEGER;
  v_transaction_type VARCHAR(20);
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_quantity_before := 0;
    v_quantity_after := NEW.quantity;
    v_quantity_change := NEW.quantity;
    v_transaction_type := 'ADD';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.quantity = NEW.quantity THEN
      RETURN NEW;
    END IF;
    v_quantity_before := OLD.quantity;
    v_quantity_after := NEW.quantity;
    v_quantity_change := NEW.quantity - OLD.quantity;
    IF v_quantity_change > 0 THEN
      v_transaction_type := 'ADD';
    ELSE
      v_transaction_type := 'REMOVE';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_quantity_before := OLD.quantity;
    v_quantity_after := 0;
    v_quantity_change := -OLD.quantity;
    v_transaction_type := 'DELETE';
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO transactions (
      inventory_item_id, user_id, transaction_type, quantity_change,
      quantity_before, quantity_after, from_location_id, to_location_id, notes
    ) VALUES (
      OLD.id, OLD.user_id, v_transaction_type, v_quantity_change,
      v_quantity_before, v_quantity_after, OLD.location_id, NULL, 'Automatic transaction log'
    );
    RETURN OLD;
  ELSE
    INSERT INTO transactions (
      inventory_item_id, user_id, transaction_type, quantity_change,
      quantity_before, quantity_after, from_location_id, to_location_id, notes
    ) VALUES (
      NEW.id, NEW.user_id, v_transaction_type, v_quantity_change,
      v_quantity_before, v_quantity_after,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.location_id ELSE NULL END,
      NEW.location_id, 'Automatic transaction log'
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply inventory transaction trigger
DROP TRIGGER IF EXISTS log_inventory_changes ON inventory_items;
CREATE TRIGGER log_inventory_changes
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_transaction();

-- Location move logging function
CREATE OR REPLACE FUNCTION log_location_move()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.location_id IS DISTINCT FROM NEW.location_id THEN
    INSERT INTO transactions (
      inventory_item_id, user_id, transaction_type, quantity_change,
      quantity_before, quantity_after, from_location_id, to_location_id, notes
    ) VALUES (
      NEW.id, NEW.user_id, 'MOVE', 0, NEW.quantity, NEW.quantity,
      OLD.location_id, NEW.location_id, 'Location change'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply location move trigger
DROP TRIGGER IF EXISTS log_inventory_location_moves ON inventory_items;
CREATE TRIGGER log_inventory_location_moves
  AFTER UPDATE OF location_id ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_location_move();

-- =====================================================
-- SEED DATA
-- =====================================================
INSERT INTO categories (name, description, minimum_stock_level, color) VALUES
  ('Lands', 'Non-basic land cards', 0, '#8B4513'),
  ('Common', 'Common rarity cards', 0, '#000000'),
  ('Uncommon', 'Uncommon rarity cards', 0, '#C0C0C0'),
  ('Rare', 'Rare rarity cards', 0, '#FFD700'),
  ('Mythic', 'Mythic rare cards', 0, '#FF8C00'),
  ('Bulk', 'Bulk cards for trade or sale', 0, '#808080'),
  ('Token', 'Token cards', 0, '#90EE90'),
  ('Basic Land', 'Basic land cards (Plains, Island, Swamp, Mountain, Forest)', 0, '#228B22'),
  ('Special', 'Special promotional or limited edition cards', 0, '#9400D3')
ON CONFLICT (name) DO NOTHING;

-- Record this migration
INSERT INTO schema_migrations (migration_name) VALUES ('001_initial_schema')
ON CONFLICT (migration_name) DO NOTHING;
