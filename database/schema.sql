-- BigDeckApp PostgreSQL Schema
-- Magic: The Gathering Card Inventory Tracker
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
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
CREATE TABLE categories (
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
CREATE TABLE locations (
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
CREATE TABLE cards (
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

CREATE INDEX idx_cards_scryfall_id ON cards(scryfall_id);
CREATE INDEX idx_cards_oracle_id ON cards(oracle_id);
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_set_code ON cards(set_code);

-- =====================================================
-- TRADES TABLE (Created before transactions due to FK)
-- =====================================================
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) NOT NULL,
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_trades_initiator ON trades(initiator_user_id);
CREATE INDEX idx_trades_recipient ON trades(recipient_user_id);
CREATE INDEX idx_trades_status ON trades(status);

-- =====================================================
-- INVENTORY_ITEMS TABLE
-- =====================================================
CREATE TABLE inventory_items (
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

CREATE INDEX idx_inventory_card_id ON inventory_items(card_id);
CREATE INDEX idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_location_id ON inventory_items(location_id);
CREATE INDEX idx_inventory_category_id ON inventory_items(category_id);
CREATE INDEX idx_inventory_variants ON inventory_items(card_id, condition, foil, finish, frame_effects);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE transactions (
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

CREATE INDEX idx_transactions_item_id ON transactions(inventory_item_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- =====================================================
-- TRADE_ITEMS TABLE
-- =====================================================
CREATE TABLE trade_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW()
);
