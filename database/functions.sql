-- BigDeckApp Database Functions and Triggers
-- Auto-update timestamps and transaction logging

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates the updated_at column
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to locations table
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to inventory_items table
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INVENTORY TRANSACTION LOGGING FUNCTION
-- Automatically logs inventory changes to transactions
-- =====================================================
CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_quantity_before INTEGER;
  v_quantity_after INTEGER;
  v_quantity_change INTEGER;
  v_transaction_type VARCHAR(20);
BEGIN
  -- Determine transaction type and quantities
  IF TG_OP = 'INSERT' THEN
    v_quantity_before := 0;
    v_quantity_after := NEW.quantity;
    v_quantity_change := NEW.quantity;
    v_transaction_type := 'ADD';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if quantity actually changed
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

  -- Insert transaction record
  IF TG_OP = 'DELETE' THEN
    INSERT INTO transactions (
      inventory_item_id,
      user_id,
      transaction_type,
      quantity_change,
      quantity_before,
      quantity_after,
      from_location_id,
      to_location_id,
      notes
    ) VALUES (
      OLD.id,
      OLD.user_id,
      v_transaction_type,
      v_quantity_change,
      v_quantity_before,
      v_quantity_after,
      OLD.location_id,
      NULL,
      'Automatic transaction log'
    );
    RETURN OLD;
  ELSE
    INSERT INTO transactions (
      inventory_item_id,
      user_id,
      transaction_type,
      quantity_change,
      quantity_before,
      quantity_after,
      from_location_id,
      to_location_id,
      notes
    ) VALUES (
      NEW.id,
      NEW.user_id,
      v_transaction_type,
      v_quantity_change,
      v_quantity_before,
      v_quantity_after,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.location_id ELSE NULL END,
      NEW.location_id,
      'Automatic transaction log'
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply inventory transaction trigger
CREATE TRIGGER log_inventory_changes
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_transaction();

-- =====================================================
-- LOCATION MOVE LOGGING FUNCTION
-- Logs when items are moved between locations
-- =====================================================
CREATE OR REPLACE FUNCTION log_location_move()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if location actually changed and it's not a new item
  IF TG_OP = 'UPDATE' AND OLD.location_id IS DISTINCT FROM NEW.location_id THEN
    INSERT INTO transactions (
      inventory_item_id,
      user_id,
      transaction_type,
      quantity_change,
      quantity_before,
      quantity_after,
      from_location_id,
      to_location_id,
      notes
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'MOVE',
      0,
      NEW.quantity,
      NEW.quantity,
      OLD.location_id,
      NEW.location_id,
      'Location change'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply location move trigger
CREATE TRIGGER log_inventory_location_moves
  AFTER UPDATE OF location_id ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_location_move();
