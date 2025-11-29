#!/usr/bin/env node
/**
 * BigDeckApp Scryfall Sync Utility
 * Fetches and caches card data from the Scryfall API
 * 
 * Note: Requires Node.js 18+ for native fetch API (Node.js 20 used in this project)
 */

const db = require('../database/connection');

require('dotenv').config();

const SCRYFALL_API_BASE = process.env.SCRYFALL_API_BASE_URL || 'https://api.scryfall.com';
const RATE_LIMIT_DELAY = 100; // 100ms between requests (Scryfall asks for 50-100ms)

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a card from Scryfall by ID
 * @param {string} scryfallId - Scryfall card ID
 * @returns {Promise<Object>} Card data
 */
async function fetchCardFromScryfall(scryfallId) {
  const response = await fetch(`${SCRYFALL_API_BASE}/cards/${scryfallId}`);
  
  if (!response.ok) {
    throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Search for cards on Scryfall
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of card data
 */
async function searchCards(query) {
  const cards = [];
  let hasMore = true;
  let url = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}`;

  while (hasMore) {
    const response = await fetch(url);
    
    if (response.status === 404) {
      // No results found
      return cards;
    }
    
    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    cards.push(...data.data);
    
    hasMore = data.has_more;
    if (hasMore) {
      url = data.next_page;
      await sleep(RATE_LIMIT_DELAY);
    }
  }

  return cards;
}

/**
 * Upsert a card into the database
 * @param {Object} cardData - Scryfall card data
 * @returns {Promise<Object>} Database card record
 */
async function upsertCard(cardData) {
  const result = await db.query(
    `INSERT INTO cards (
      scryfall_id, oracle_id, name, set_code, collector_number,
      rarity, card_type, mana_cost, cmc, colors,
      image_uris, prices, scryfall_uri, last_synced_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    ON CONFLICT (scryfall_id) DO UPDATE SET
      oracle_id = EXCLUDED.oracle_id,
      name = EXCLUDED.name,
      set_code = EXCLUDED.set_code,
      collector_number = EXCLUDED.collector_number,
      rarity = EXCLUDED.rarity,
      card_type = EXCLUDED.card_type,
      mana_cost = EXCLUDED.mana_cost,
      cmc = EXCLUDED.cmc,
      colors = EXCLUDED.colors,
      image_uris = EXCLUDED.image_uris,
      prices = EXCLUDED.prices,
      scryfall_uri = EXCLUDED.scryfall_uri,
      last_synced_at = NOW()
    RETURNING *`,
    [
      cardData.id,
      cardData.oracle_id,
      cardData.name,
      cardData.set,
      cardData.collector_number,
      cardData.rarity,
      cardData.type_line,
      cardData.mana_cost,
      cardData.cmc,
      cardData.colors || [],
      JSON.stringify(cardData.image_uris || {}),
      JSON.stringify(cardData.prices || {}),
      cardData.scryfall_uri,
    ]
  );

  return result.rows[0];
}

/**
 * Sync cards that need updating (older than specified hours)
 * @param {number} maxAgeHours - Maximum age in hours before resync
 * @returns {Promise<number>} Number of cards synced
 */
async function syncStaleCards(maxAgeHours = 24) {
  // Validate and sanitize maxAgeHours to prevent SQL injection
  const hours = Math.max(1, Math.min(8760, parseInt(maxAgeHours, 10) || 24));
  console.log(`Syncing cards older than ${hours} hours...`);
  
  const result = await db.query(
    `SELECT scryfall_id FROM cards 
     WHERE last_synced_at IS NULL 
        OR last_synced_at < NOW() - INTERVAL '1 hour' * $1
     LIMIT 100`,
    [hours]
  );

  let synced = 0;
  for (const row of result.rows) {
    try {
      const cardData = await fetchCardFromScryfall(row.scryfall_id);
      await upsertCard(cardData);
      synced++;
      console.log(`  ✅ Synced: ${cardData.name}`);
      await sleep(RATE_LIMIT_DELAY);
    } catch (error) {
      console.error(`  ❌ Failed to sync ${row.scryfall_id}: ${error.message}`);
    }
  }

  return synced;
}

/**
 * Import cards by search query
 * @param {string} query - Scryfall search query
 * @returns {Promise<number>} Number of cards imported
 */
async function importCardsBySearch(query) {
  console.log(`Searching for cards: ${query}`);
  
  const cards = await searchCards(query);
  console.log(`Found ${cards.length} cards`);

  let imported = 0;
  for (const cardData of cards) {
    try {
      await upsertCard(cardData);
      imported++;
      if (imported % 50 === 0) {
        console.log(`  Imported ${imported}/${cards.length} cards...`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to import ${cardData.name}: ${error.message}`);
    }
  }

  console.log(`✅ Imported ${imported} cards`);
  return imported;
}

/**
 * Get or create a card by Scryfall ID
 * @param {string} scryfallId - Scryfall card ID
 * @returns {Promise<Object>} Database card record
 */
async function getOrCreateCard(scryfallId) {
  // Check if card exists
  const existing = await db.query(
    'SELECT * FROM cards WHERE scryfall_id = $1',
    [scryfallId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Fetch from Scryfall and insert
  const cardData = await fetchCardFromScryfall(scryfallId);
  return upsertCard(cardData);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎴 BigDeckApp Scryfall Sync Utility');
  console.log('===================================\n');

  try {
    switch (command) {
      case 'search':
        if (!args[1]) {
          console.error('Usage: node sync-scryfall.js search "query"');
          process.exit(1);
        }
        await importCardsBySearch(args.slice(1).join(' '));
        break;

      case 'sync':
        const hours = parseInt(args[1], 10) || 24;
        const count = await syncStaleCards(hours);
        console.log(`\nSynced ${count} cards`);
        break;

      case 'card':
        if (!args[1]) {
          console.error('Usage: node sync-scryfall.js card <scryfall-id>');
          process.exit(1);
        }
        const card = await getOrCreateCard(args[1]);
        console.log('Card:', JSON.stringify(card, null, 2));
        break;

      default:
        console.log('Usage:');
        console.log('  node sync-scryfall.js search "query"  - Import cards matching query');
        console.log('  node sync-scryfall.js sync [hours]    - Sync stale cards (default: 24 hours)');
        console.log('  node sync-scryfall.js card <id>       - Get or create a specific card');
        console.log('');
        console.log('Examples:');
        console.log('  node sync-scryfall.js search "lightning bolt"');
        console.log('  node sync-scryfall.js search "set:mh3 rarity:mythic"');
        console.log('  node sync-scryfall.js sync 48');
        break;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Export functions for use as a module
module.exports = {
  fetchCardFromScryfall,
  searchCards,
  upsertCard,
  syncStaleCards,
  importCardsBySearch,
  getOrCreateCard,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
