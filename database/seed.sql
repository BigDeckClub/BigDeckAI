-- BigDeckApp Seed Data
-- Initial categories for card organization

INSERT INTO categories (name, description, minimum_stock_level, color) VALUES
  ('Lands', 'Non-basic land cards', 0, '#8B4513'),
  ('Common', 'Common rarity cards', 0, '#000000'),
  ('Uncommon', 'Uncommon rarity cards', 0, '#C0C0C0'),
  ('Rare', 'Rare rarity cards', 0, '#FFD700'),
  ('Mythic', 'Mythic rare cards', 0, '#FF8C00'),
  ('Bulk', 'Bulk cards for trade or sale', 0, '#808080'),
  ('Token', 'Token cards', 0, '#90EE90'),
  ('Basic Land', 'Basic land cards (Plains, Island, Swamp, Mountain, Forest)', 0, '#228B22'),
  ('Special', 'Special promotional or limited edition cards', 0, '#9400D3');
