#!/usr/bin/env node
/**
 * BigDeckApp Scryfall Sync Utility
 * Fetches and caches card data from the Scryfall API
 *
 * @module scripts/sync-scryfall
 * @description CLI tool for syncing card data from Scryfall API to local database.
 * Supports search, sync stale cards, and individual card fetching.
 *
 * Note: Requires Node.js 18+ for native fetch API (Node.js 20 used in this project)
 */

const db = require('../database/connection');

require('dotenv').config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const SCRYFALL_API_BASE = process.env.SCRYFALL_API_BASE_URL || 'https://api.scryfall.com';
const RATE_LIMIT_DELAY = parseInt(process.env.SCRYFALL_RATE_LIMIT_DELAY, 10) || 100;
const MAX_RETRIES = parseInt(process.env.SCRYFALL_MAX_RETRIES, 10) || 3;
const RETRY_BASE_DELAY = 1000; // 1 second base delay for retries

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
function calculateBackoff(attempt, baseDelay = RETRY_BASE_DELAY, maxDelay = 30000) {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Format a progress bar string
 * @param {number} current - Current progress value
 * @param {number} total - Total value
 * @param {number} [width=30] - Width of the progress bar
 * @returns {string} Formatted progress bar
 */
function progressBar(current, total, width = 30) {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percentage}% (${current}/${total})`;
}

/**
 * Clear the current line and print new content
 * @param {string} content - Content to print
 */
function printProgress(content) {
  if (process.stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(content);
  } else {
    console.log(content);
  }
}

/**
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @param {number} statusCode - HTTP status code if available
 * @returns {boolean} True if the error is retryable
 */
function isRetryableError(error, statusCode) {
  // Retry on network errors
  if (error.cause?.code === 'ECONNRESET' || error.cause?.code === 'ETIMEDOUT' || error.cause?.code === 'ENOTFOUND') {
    return true;
  }

  // Retry on 429 (rate limited) and 5xx server errors
  if (statusCode === 429 || (statusCode >= 500 && statusCode < 600)) {
    return true;
  }

  return false;
}

/**
 * Validate Scryfall card response
 * @param {Object} data - Scryfall API response
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
function validateCardResponse(data) {
  const errors = [];

  if (!data) {
    errors.push('Response is null or undefined');
    return { valid: false, errors };
  }

  if (!data.id) {
    errors.push('Missing required field: id');
  }

  if (!data.name) {
    errors.push('Missing required field: name');
  }

  if (!data.set) {
    errors.push('Missing required field: set');
  }

  // Validate UUID format for id
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (data.id && !uuidRegex.test(data.id)) {
    errors.push('Invalid id format: not a valid UUID');
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// SCRYFALL API FUNCTIONS
// =============================================================================

/**
 * Make an HTTP request with retry logic
 * @param {string} url - URL to fetch
 * @param {Object} [options] - Fetch options
 * @returns {Promise<Object>} Response data
 * @throws {Error} If all retries fail
 */
async function fetchWithRetry(url, options = {}) {
  let lastError;
  let lastStatusCode;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'BigDeckApp/1.0.0',
          Accept: 'application/json',
          ...options.headers,
        },
      });

      lastStatusCode = response.status;

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After'), 10) || 60;
        console.warn(`\n⏳ Rate limited. Waiting ${retryAfter} seconds...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      // Handle 404 specially - not an error for search
      if (response.status === 404) {
        return { notFound: true };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;

      if (isRetryableError(error, lastStatusCode) && attempt < MAX_RETRIES - 1) {
        const backoff = calculateBackoff(attempt);
        console.warn(`\n⚠️  Request failed (attempt ${attempt + 1}/${MAX_RETRIES}): ${error.message}`);
        console.log(`   Retrying in ${Math.round(backoff / 1000)}s...`);
        await sleep(backoff);
      }
    }
  }

  throw new Error(`Request failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

/**
 * Fetch a card from Scryfall by ID
 * @param {string} scryfallId - Scryfall card ID
 * @returns {Promise<Object>} Card data
 * @throws {Error} If request fails or card not found
 */
async function fetchCardFromScryfall(scryfallId) {
  // Validate scryfallId format
  if (!scryfallId || typeof scryfallId !== 'string') {
    throw new Error('Invalid Scryfall ID: must be a non-empty string');
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(scryfallId)) {
    throw new Error(`Invalid Scryfall ID format: ${scryfallId}`);
  }

  const data = await fetchWithRetry(`${SCRYFALL_API_BASE}/cards/${scryfallId}`);

  if (data.notFound) {
    throw new Error(`Card not found: ${scryfallId}`);
  }

  // Validate response
  const validation = validateCardResponse(data);
  if (!validation.valid) {
    throw new Error(`Invalid card response: ${validation.errors.join(', ')}`);
  }

  return data;
}

/**
 * Search for cards on Scryfall
 * @param {string} query - Search query
 * @param {Object} [options] - Search options
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Array>} Array of card data
 */
async function searchCards(query, options = {}) {
  const { onProgress } = options;
  const cards = [];
  let hasMore = true;
  let url = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}`;
  let pageCount = 0;

  while (hasMore) {
    const data = await fetchWithRetry(url);

    if (data.notFound) {
      // No results found
      return cards;
    }

    // Validate each card in the response
    const validCards = data.data.filter((card) => {
      const validation = validateCardResponse(card);
      if (!validation.valid) {
        console.warn(`⚠️  Skipping invalid card: ${validation.errors.join(', ')}`);
        return false;
      }
      return true;
    });

    cards.push(...validCards);
    pageCount++;

    if (onProgress) {
      onProgress({
        cardsFound: cards.length,
        pages: pageCount,
        hasMore: data.has_more,
      });
    }

    hasMore = data.has_more;
    if (hasMore) {
      url = data.next_page;
      await sleep(RATE_LIMIT_DELAY);
    }
  }

  return cards;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Upsert a card into the database
 * @param {Object} cardData - Scryfall card data
 * @returns {Promise<Object>} Database card record
 */
async function upsertCard(cardData) {
  // Validate input
  const validation = validateCardResponse(cardData);
  if (!validation.valid) {
    throw new Error(`Cannot upsert invalid card: ${validation.errors.join(', ')}`);
  }

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
      cardData.oracle_id || null,
      cardData.name,
      cardData.set,
      cardData.collector_number || null,
      cardData.rarity || null,
      cardData.type_line || null,
      cardData.mana_cost || null,
      cardData.cmc || 0,
      cardData.colors || [],
      JSON.stringify(cardData.image_uris || {}),
      JSON.stringify(cardData.prices || {}),
      cardData.scryfall_uri || null,
    ]
  );

  return result.rows[0];
}

/**
 * Sync cards that need updating (older than specified hours)
 * @param {number} maxAgeHours - Maximum age in hours before resync
 * @param {Object} [options] - Sync options
 * @param {number} [options.limit=100] - Maximum number of cards to sync
 * @returns {Promise<Object>} Sync results { synced: number, failed: number, errors: Array }
 */
async function syncStaleCards(maxAgeHours = 24, options = {}) {
  const { limit = 100 } = options;

  // Validate and sanitize maxAgeHours
  const hours = Math.max(1, Math.min(8760, parseInt(maxAgeHours, 10) || 24));
  const cardLimit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 100));

  console.log(`\n📊 Syncing cards older than ${hours} hours (limit: ${cardLimit})...\n`);

  const result = await db.query(
    `SELECT scryfall_id, name FROM cards 
     WHERE last_synced_at IS NULL 
        OR last_synced_at < NOW() - INTERVAL '1 hour' * $1
     LIMIT $2`,
    [hours, cardLimit]
  );

  if (result.rows.length === 0) {
    console.log('✅ All cards are up to date!\n');
    return { synced: 0, failed: 0, errors: [] };
  }

  console.log(`Found ${result.rows.length} cards to sync\n`);

  const errors = [];
  let synced = 0;
  let failed = 0;

  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows[i];

    try {
      const cardData = await fetchCardFromScryfall(row.scryfall_id);
      await upsertCard(cardData);
      synced++;

      printProgress(`${progressBar(i + 1, result.rows.length)} ✅ ${cardData.name}`);

      await sleep(RATE_LIMIT_DELAY);
    } catch (error) {
      failed++;
      errors.push({ id: row.scryfall_id, name: row.name, error: error.message });

      printProgress(`${progressBar(i + 1, result.rows.length)} ❌ ${row.name || row.scryfall_id}`);

      // Continue with next card after a short delay
      await sleep(RATE_LIMIT_DELAY);
    }
  }

  console.log('\n');

  if (errors.length > 0) {
    console.log('❌ Failed cards:');
    errors.forEach((e) => console.log(`   - ${e.name || e.id}: ${e.error}`));
    console.log('');
  }

  return { synced, failed, errors };
}

/**
 * Import cards by search query
 * @param {string} query - Scryfall search query
 * @returns {Promise<Object>} Import results { imported: number, failed: number, total: number }
 */
async function importCardsBySearch(query) {
  console.log(`\n🔍 Searching for cards: "${query}"\n`);

  const cards = await searchCards(query, {
    onProgress: ({ cardsFound, pages }) => {
      printProgress(`   Fetching... Found ${cardsFound} cards (page ${pages})`);
    },
  });

  console.log('\n');

  if (cards.length === 0) {
    console.log('⚠️  No cards found matching your query.\n');
    return { imported: 0, failed: 0, total: 0 };
  }

  console.log(`📥 Importing ${cards.length} cards...\n`);

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < cards.length; i++) {
    const cardData = cards[i];

    try {
      await upsertCard(cardData);
      imported++;

      // Update progress every card or at milestones
      printProgress(`${progressBar(i + 1, cards.length)} ${cardData.name}`);
    } catch (error) {
      failed++;
      db.logger.error(`Failed to import ${cardData.name}`, { error: error.message });
    }
  }

  console.log('\n');
  console.log(`✅ Import complete: ${imported} imported, ${failed} failed\n`);

  return { imported, failed, total: cards.length };
}

/**
 * Get or create a card by Scryfall ID
 * @param {string} scryfallId - Scryfall card ID
 * @returns {Promise<Object>} Database card record
 */
async function getOrCreateCard(scryfallId) {
  // Validate input
  if (!scryfallId || typeof scryfallId !== 'string') {
    throw new Error('Scryfall ID is required');
  }

  // Check if card exists
  const existing = await db.query('SELECT * FROM cards WHERE scryfall_id = $1', [scryfallId]);

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Fetch from Scryfall and insert
  const cardData = await fetchCardFromScryfall(scryfallId);
  return upsertCard(cardData);
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

/**
 * Print help message
 */
function printHelp() {
  console.log('Usage:');
  console.log('  node sync-scryfall.js search "query"         - Import cards matching query');
  console.log('  node sync-scryfall.js sync [hours] [limit]   - Sync stale cards');
  console.log('  node sync-scryfall.js card <scryfall-id>     - Get or create a specific card');
  console.log('  node sync-scryfall.js help                   - Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node sync-scryfall.js search "lightning bolt"');
  console.log('  node sync-scryfall.js search "set:mh3 rarity:mythic"');
  console.log('  node sync-scryfall.js search "type:creature cmc:2"');
  console.log('  node sync-scryfall.js sync 48');
  console.log('  node sync-scryfall.js sync 24 50');
  console.log('  node sync-scryfall.js card "3b3e3535-5e86-4dc2-a7a5-f0379a4a1b92"');
  console.log('');
  console.log('Environment Variables:');
  console.log('  SCRYFALL_API_BASE_URL    - Scryfall API base URL (default: https://api.scryfall.com)');
  console.log('  SCRYFALL_RATE_LIMIT_DELAY - Delay between requests in ms (default: 100)');
  console.log('  SCRYFALL_MAX_RETRIES     - Max retries for failed requests (default: 3)');
  console.log('');
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎴 BigDeckApp Scryfall Sync Utility');
  console.log('===================================');

  try {
    switch (command) {
      case 'search':
        if (!args[1]) {
          console.error('\n❌ Error: Search query is required');
          console.log('Usage: node sync-scryfall.js search "query"\n');
          process.exit(1);
        }
        await importCardsBySearch(args.slice(1).join(' '));
        break;

      case 'sync': {
        const hours = parseInt(args[1], 10) || 24;
        const limit = parseInt(args[2], 10) || 100;
        const results = await syncStaleCards(hours, { limit });
        console.log(`📊 Summary: ${results.synced} synced, ${results.failed} failed\n`);
        break;
      }

      case 'card':
        if (!args[1]) {
          console.error('\n❌ Error: Scryfall ID is required');
          console.log('Usage: node sync-scryfall.js card <scryfall-id>\n');
          process.exit(1);
        }
        console.log(`\n🔍 Looking up card: ${args[1]}\n`);
        const card = await getOrCreateCard(args[1]);
        console.log('Card found:\n');
        console.log(`  Name: ${card.name}`);
        console.log(`  Set: ${card.set_code} #${card.collector_number}`);
        console.log(`  Rarity: ${card.rarity}`);
        console.log(`  Type: ${card.card_type}`);
        if (card.mana_cost) console.log(`  Mana Cost: ${card.mana_cost}`);
        console.log(`  Last Synced: ${card.last_synced_at}`);
        console.log('');
        break;

      case 'help':
      case '--help':
      case '-h':
        printHelp();
        break;

      default:
        printHelp();
        break;
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await db.close();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  fetchCardFromScryfall,
  searchCards,
  upsertCard,
  syncStaleCards,
  importCardsBySearch,
  getOrCreateCard,
  validateCardResponse,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
