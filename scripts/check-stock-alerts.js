#!/usr/bin/env node
/**
 * BigDeckApp Stock Alert Checker
 * Checks inventory against minimum stock levels defined in categories
 *
 * @module scripts/check-stock-alerts
 * @description CLI tool for checking inventory stock levels and generating alerts.
 * Supports multiple output formats including console and CSV.
 */

const db = require('../database/connection');

require('dotenv').config();

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Valid UUID regex pattern
 * @type {RegExp}
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Maximum allowed threshold value
 * @type {number}
 */
const MAX_THRESHOLD = 10000;

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate and sanitize user ID
 * @param {string} userId - User ID to validate
 * @returns {Object} Validation result { valid: boolean, value: string|null, error: string|null }
 */
function validateUserId(userId) {
  if (!userId) {
    return { valid: false, value: null, error: 'User ID is required' };
  }

  if (typeof userId !== 'string') {
    return { valid: false, value: null, error: 'User ID must be a string' };
  }

  const trimmed = userId.trim();

  if (trimmed.length === 0) {
    return { valid: false, value: null, error: 'User ID cannot be empty' };
  }

  // Validate UUID format
  if (!UUID_REGEX.test(trimmed)) {
    return {
      valid: false,
      value: null,
      error: 'User ID must be a valid UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    };
  }

  return { valid: true, value: trimmed, error: null };
}

/**
 * Validate and sanitize threshold value
 * @param {string|number} threshold - Threshold to validate
 * @param {number} [defaultValue=1] - Default value if not provided
 * @returns {Object} Validation result { valid: boolean, value: number, error: string|null }
 */
function validateThreshold(threshold, defaultValue = 1) {
  if (threshold === undefined || threshold === null || threshold === '') {
    return { valid: true, value: defaultValue, error: null };
  }

  const parsed = parseInt(threshold, 10);

  if (isNaN(parsed)) {
    return { valid: false, value: defaultValue, error: 'Threshold must be a number' };
  }

  if (parsed < 0) {
    return { valid: false, value: defaultValue, error: 'Threshold cannot be negative' };
  }

  if (parsed > MAX_THRESHOLD) {
    return { valid: false, value: defaultValue, error: `Threshold cannot exceed ${MAX_THRESHOLD}` };
  }

  return { valid: true, value: parsed, error: null };
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Get all categories with their minimum stock levels
 * @returns {Promise<Array>} Array of categories
 */
async function getCategories() {
  const result = await db.query('SELECT id, name, minimum_stock_level, color FROM categories WHERE minimum_stock_level > 0');
  return result.rows;
}

/**
 * Get inventory summary by category for a user
 * @param {string} userId - User ID (validated UUID)
 * @returns {Promise<Array>} Array of category summaries
 */
async function getInventorySummaryByCategory(userId) {
  const result = await db.query(
    `SELECT 
      c.id as category_id,
      c.name as category_name,
      c.minimum_stock_level,
      c.color,
      COALESCE(SUM(i.quantity), 0) as total_quantity,
      COUNT(DISTINCT i.card_id) as unique_cards
    FROM categories c
    LEFT JOIN inventory_items i ON i.category_id = c.id AND i.user_id = $1
    GROUP BY c.id, c.name, c.minimum_stock_level, c.color
    ORDER BY c.name`,
    [userId]
  );
  return result.rows;
}

/**
 * Check for low stock alerts for a user
 * @param {string} userId - User ID (validated UUID)
 * @returns {Promise<Array>} Array of alerts
 */
async function checkStockAlerts(userId) {
  const summary = await getInventorySummaryByCategory(userId);
  const alerts = [];

  for (const category of summary) {
    if (category.minimum_stock_level > 0 && category.total_quantity < category.minimum_stock_level) {
      alerts.push({
        category_id: category.category_id,
        category_name: category.category_name,
        current_stock: parseInt(category.total_quantity, 10),
        minimum_stock: category.minimum_stock_level,
        shortage: category.minimum_stock_level - parseInt(category.total_quantity, 10),
        color: category.color,
      });
    }
  }

  return alerts;
}

/**
 * Check for low stock items (individual cards below threshold)
 * @param {string} userId - User ID (validated UUID)
 * @param {number} threshold - Minimum quantity threshold
 * @returns {Promise<Array>} Array of low stock items
 */
async function getLowStockItems(userId, threshold = 1) {
  const result = await db.query(
    `SELECT 
      i.id as inventory_id,
      c.name as card_name,
      c.set_code,
      c.collector_number,
      c.rarity,
      i.quantity,
      i.condition,
      i.foil,
      cat.name as category_name,
      l.name as location_name
    FROM inventory_items i
    JOIN cards c ON i.card_id = c.id
    LEFT JOIN categories cat ON i.category_id = cat.id
    LEFT JOIN locations l ON i.location_id = l.id
    WHERE i.user_id = $1 AND i.quantity <= $2
    ORDER BY i.quantity ASC, c.name ASC`,
    [userId, threshold]
  );
  return result.rows;
}

/**
 * Get overall inventory statistics for a user
 * @param {string} userId - User ID (validated UUID)
 * @returns {Promise<Object>} Statistics object
 */
async function getInventoryStats(userId) {
  const result = await db.query(
    `SELECT 
      COUNT(DISTINCT i.id) as total_items,
      COUNT(DISTINCT i.card_id) as unique_cards,
      COALESCE(SUM(i.quantity), 0) as total_quantity,
      COALESCE(SUM(i.purchase_price * i.quantity), 0) as total_value
    FROM inventory_items i
    WHERE i.user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

// =============================================================================
// OUTPUT FORMATTING
// =============================================================================

/**
 * Create a horizontal separator line
 * @param {number} width - Line width
 * @param {string} [char='─'] - Character to use
 * @returns {string} Separator line
 */
function separator(width = 60, char = '─') {
  return char.repeat(width);
}

/**
 * Format alerts for console display
 * @param {Array} alerts - Array of alert objects
 * @returns {string} Formatted string
 */
function formatAlerts(alerts) {
  if (alerts.length === 0) {
    return '\n✅ No stock alerts - all categories are above minimum levels\n';
  }

  let output = '\n⚠️  Stock Alerts\n';
  output += separator() + '\n';

  for (const alert of alerts) {
    const statusBar = createStatusBar(alert.current_stock, alert.minimum_stock);
    output += `\n📦 ${alert.category_name}\n`;
    output += `   ${statusBar}\n`;
    output += `   Current: ${alert.current_stock} | Minimum: ${alert.minimum_stock}\n`;
    output += `   Shortage: ${alert.shortage} item${alert.shortage !== 1 ? 's' : ''} needed\n`;
  }

  output += '\n' + separator() + '\n';
  output += `Total alerts: ${alerts.length}\n`;

  return output;
}

/**
 * Create a visual status bar
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} [width=20] - Bar width
 * @returns {string} Status bar string
 */
function createStatusBar(current, target, width = 20) {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  let color = '🟢';
  if (percentage < 25) color = '🔴';
  else if (percentage < 50) color = '🟠';
  else if (percentage < 75) color = '🟡';

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${color} [${bar}] ${percentage}%`;
}

/**
 * Format low stock items for console display
 * @param {Array} items - Array of low stock items
 * @param {number} threshold - Threshold used
 * @returns {string} Formatted string
 */
function formatLowStockItems(items, threshold) {
  if (items.length === 0) {
    return `\n✅ No items with quantity ≤ ${threshold}\n`;
  }

  let output = `\n📋 Items with quantity ≤ ${threshold}\n`;
  output += separator() + '\n\n';

  for (const item of items) {
    const foilBadge = item.foil ? ' ✨' : '';
    const rarityBadge = getRarityBadge(item.rarity);

    output += `  ${rarityBadge} ${item.card_name}${foilBadge}\n`;
    output += `     Set: ${item.set_code || 'N/A'}`;
    if (item.collector_number) output += ` #${item.collector_number}`;
    output += '\n';
    output += `     Qty: ${item.quantity} | Condition: ${item.condition || 'N/A'}\n`;
    if (item.category_name) output += `     Category: ${item.category_name}\n`;
    if (item.location_name) output += `     Location: ${item.location_name}\n`;
    output += '\n';
  }

  output += separator() + '\n';
  output += `Total items: ${items.length}\n`;

  return output;
}

/**
 * Get rarity badge emoji
 * @param {string} rarity - Card rarity
 * @returns {string} Rarity badge
 */
function getRarityBadge(rarity) {
  const badges = {
    common: '⚫',
    uncommon: '⚪',
    rare: '🔵',
    mythic: '🟠',
  };
  return badges[rarity?.toLowerCase()] || '⬜';
}

/**
 * Format inventory statistics for console display
 * @param {Object} stats - Statistics object
 * @returns {string} Formatted string
 */
function formatStats(stats) {
  let output = '\n📊 Inventory Statistics\n';
  output += separator() + '\n\n';
  output += `  Total Items:    ${stats.total_items}\n`;
  output += `  Unique Cards:   ${stats.unique_cards}\n`;
  output += `  Total Quantity: ${stats.total_quantity}\n`;
  output += `  Total Value:    $${parseFloat(stats.total_value || 0).toFixed(2)}\n\n`;
  return output;
}

/**
 * Format category summary for console display
 * @param {Array} summary - Category summary array
 * @returns {string} Formatted string
 */
function formatCategorySummary(summary) {
  let output = '\n📊 Inventory by Category\n';
  output += separator() + '\n\n';

  for (const cat of summary) {
    const status = cat.minimum_stock_level > 0 && cat.total_quantity < cat.minimum_stock_level ? '⚠️' : '✅';

    output += `${status} ${cat.category_name}\n`;
    output += `   Total: ${cat.total_quantity} | Unique Cards: ${cat.unique_cards}\n`;
    if (cat.minimum_stock_level > 0) {
      const statusBar = createStatusBar(parseInt(cat.total_quantity, 10), cat.minimum_stock_level, 15);
      output += `   Min Stock: ${cat.minimum_stock_level} ${statusBar}\n`;
    }
    output += '\n';
  }

  return output;
}

// =============================================================================
// CSV EXPORT
// =============================================================================

/**
 * Escape a value for CSV
 * @param {any} value - Value to escape
 * @returns {string} Escaped CSV value
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert alerts to CSV format
 * @param {Array} alerts - Array of alert objects
 * @returns {string} CSV string
 */
function alertsToCsv(alerts) {
  const headers = ['Category ID', 'Category Name', 'Current Stock', 'Minimum Stock', 'Shortage', 'Color'];

  const rows = alerts.map((alert) => [
    alert.category_id,
    alert.category_name,
    alert.current_stock,
    alert.minimum_stock,
    alert.shortage,
    alert.color || '',
  ]);

  return [headers.map(escapeCsvValue).join(','), ...rows.map((row) => row.map(escapeCsvValue).join(','))].join('\n');
}

/**
 * Convert low stock items to CSV format
 * @param {Array} items - Array of low stock items
 * @returns {string} CSV string
 */
function lowStockItemsToCsv(items) {
  const headers = [
    'Inventory ID',
    'Card Name',
    'Set Code',
    'Collector Number',
    'Rarity',
    'Quantity',
    'Condition',
    'Foil',
    'Category',
    'Location',
  ];

  const rows = items.map((item) => [
    item.inventory_id,
    item.card_name,
    item.set_code || '',
    item.collector_number || '',
    item.rarity || '',
    item.quantity,
    item.condition || '',
    item.foil ? 'Yes' : 'No',
    item.category_name || '',
    item.location_name || '',
  ]);

  return [headers.map(escapeCsvValue).join(','), ...rows.map((row) => row.map(escapeCsvValue).join(','))].join('\n');
}

/**
 * Convert category summary to CSV format
 * @param {Array} summary - Category summary array
 * @returns {string} CSV string
 */
function summaryToCsv(summary) {
  const headers = ['Category ID', 'Category Name', 'Minimum Stock Level', 'Total Quantity', 'Unique Cards', 'Status'];

  const rows = summary.map((cat) => {
    const belowMin = cat.minimum_stock_level > 0 && cat.total_quantity < cat.minimum_stock_level;
    return [cat.category_id, cat.category_name, cat.minimum_stock_level, cat.total_quantity, cat.unique_cards, belowMin ? 'Below Minimum' : 'OK'];
  });

  return [headers.map(escapeCsvValue).join(','), ...rows.map((row) => row.map(escapeCsvValue).join(','))].join('\n');
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

/**
 * Print help message
 */
function printHelp() {
  console.log('Usage:');
  console.log('  node check-stock-alerts.js check <user-id> [--csv]           - Check category stock alerts');
  console.log('  node check-stock-alerts.js low <user-id> [threshold] [--csv] - List low stock items');
  console.log('  node check-stock-alerts.js stats <user-id>                   - Show inventory statistics');
  console.log('  node check-stock-alerts.js summary <user-id> [--csv]         - Show category summary');
  console.log('  node check-stock-alerts.js help                              - Show this help message');
  console.log('');
  console.log('Options:');
  console.log('  --csv    Output results in CSV format');
  console.log('');
  console.log('Examples:');
  console.log('  node check-stock-alerts.js check 12345678-1234-1234-1234-123456789012');
  console.log('  node check-stock-alerts.js low 12345678-1234-1234-1234-123456789012 5');
  console.log('  node check-stock-alerts.js check 12345678-1234-1234-1234-123456789012 --csv > alerts.csv');
  console.log('');
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const userId = args[1];
  const csvOutput = args.includes('--csv');

  // Filter out --csv from args for proper parsing
  const cleanArgs = args.filter((arg) => arg !== '--csv');

  console.log('🎴 BigDeckApp Stock Alert Checker');
  console.log('==================================');

  try {
    // Validate user ID for commands that need it
    if (['check', 'low', 'stats', 'summary'].includes(command)) {
      const userValidation = validateUserId(userId);
      if (!userValidation.valid) {
        console.error(`\n❌ Error: ${userValidation.error}`);
        console.log('\nUser ID must be a valid UUID (e.g., 12345678-1234-1234-1234-123456789012)\n');
        process.exit(1);
      }
    }

    switch (command) {
      case 'check': {
        const alerts = await checkStockAlerts(userId);

        if (csvOutput) {
          console.log(alertsToCsv(alerts));
        } else {
          console.log(formatAlerts(alerts));
        }
        break;
      }

      case 'low': {
        const thresholdValidation = validateThreshold(cleanArgs[2]);
        if (!thresholdValidation.valid) {
          console.error(`\n❌ Error: ${thresholdValidation.error}\n`);
          process.exit(1);
        }

        const lowItems = await getLowStockItems(userId, thresholdValidation.value);

        if (csvOutput) {
          console.log(lowStockItemsToCsv(lowItems));
        } else {
          console.log(formatLowStockItems(lowItems, thresholdValidation.value));
        }
        break;
      }

      case 'stats': {
        const stats = await getInventoryStats(userId);
        console.log(formatStats(stats));
        break;
      }

      case 'summary': {
        const summary = await getInventorySummaryByCategory(userId);

        if (csvOutput) {
          console.log(summaryToCsv(summary));
        } else {
          console.log(formatCategorySummary(summary));
        }
        break;
      }

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
  getCategories,
  getInventorySummaryByCategory,
  checkStockAlerts,
  getLowStockItems,
  getInventoryStats,
  validateUserId,
  validateThreshold,
  alertsToCsv,
  lowStockItemsToCsv,
  summaryToCsv,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
