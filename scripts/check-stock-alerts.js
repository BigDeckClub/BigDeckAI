#!/usr/bin/env node
/**
 * BigDeckApp Stock Alert Checker
 * Checks inventory against minimum stock levels defined in categories
 */

const db = require('../database/connection');

require('dotenv').config();

/**
 * Get all categories with their minimum stock levels
 * @returns {Promise<Array>} Array of categories
 */
async function getCategories() {
  const result = await db.query(
    'SELECT id, name, minimum_stock_level, color FROM categories WHERE minimum_stock_level > 0'
  );
  return result.rows;
}

/**
 * Get inventory summary by category for a user
 * @param {string} userId - User ID
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
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of alerts
 */
async function checkStockAlerts(userId) {
  const summary = await getInventorySummaryByCategory(userId);
  const alerts = [];

  for (const category of summary) {
    if (category.minimum_stock_level > 0 && 
        category.total_quantity < category.minimum_stock_level) {
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
 * @param {string} userId - User ID
 * @param {number} threshold - Minimum quantity threshold
 * @returns {Promise<Array>} Array of low stock items
 */
async function getLowStockItems(userId, threshold = 1) {
  const result = await db.query(
    `SELECT 
      i.id as inventory_id,
      c.name as card_name,
      c.set_code,
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
 * @param {string} userId - User ID
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

/**
 * Format alerts for display
 * @param {Array} alerts - Array of alert objects
 * @returns {string} Formatted string
 */
function formatAlerts(alerts) {
  if (alerts.length === 0) {
    return '✅ No stock alerts - all categories are above minimum levels';
  }

  let output = '⚠️  Stock Alerts:\n';
  output += '─'.repeat(60) + '\n';

  for (const alert of alerts) {
    output += `\n📦 ${alert.category_name}\n`;
    output += `   Current: ${alert.current_stock} | Minimum: ${alert.minimum_stock}\n`;
    output += `   Shortage: ${alert.shortage} items needed\n`;
  }

  return output;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const userId = args[1];

  console.log('🎴 BigDeckApp Stock Alert Checker');
  console.log('==================================\n');

  try {
    switch (command) {
      case 'check':
        if (!userId) {
          console.error('Usage: node check-stock-alerts.js check <user-id>');
          process.exit(1);
        }
        const alerts = await checkStockAlerts(userId);
        console.log(formatAlerts(alerts));
        break;

      case 'low':
        if (!userId) {
          console.error('Usage: node check-stock-alerts.js low <user-id> [threshold]');
          process.exit(1);
        }
        const threshold = parseInt(args[2], 10) || 1;
        const lowItems = await getLowStockItems(userId, threshold);
        
        if (lowItems.length === 0) {
          console.log(`✅ No items with quantity <= ${threshold}`);
        } else {
          console.log(`📋 Items with quantity <= ${threshold}:\n`);
          for (const item of lowItems) {
            console.log(`  ${item.card_name} (${item.set_code})`);
            console.log(`    Qty: ${item.quantity} | ${item.condition || 'N/A'} | ${item.foil ? 'Foil' : 'Non-foil'}`);
            if (item.location_name) {
              console.log(`    Location: ${item.location_name}`);
            }
            console.log('');
          }
        }
        break;

      case 'stats':
        if (!userId) {
          console.error('Usage: node check-stock-alerts.js stats <user-id>');
          process.exit(1);
        }
        const stats = await getInventoryStats(userId);
        console.log('📊 Inventory Statistics:\n');
        console.log(`  Total Items: ${stats.total_items}`);
        console.log(`  Unique Cards: ${stats.unique_cards}`);
        console.log(`  Total Quantity: ${stats.total_quantity}`);
        console.log(`  Total Value: $${parseFloat(stats.total_value || 0).toFixed(2)}`);
        break;

      case 'summary':
        if (!userId) {
          console.error('Usage: node check-stock-alerts.js summary <user-id>');
          process.exit(1);
        }
        const summary = await getInventorySummaryByCategory(userId);
        console.log('📊 Inventory by Category:\n');
        for (const cat of summary) {
          const status = cat.minimum_stock_level > 0 && 
                         cat.total_quantity < cat.minimum_stock_level ? '⚠️' : '✅';
          console.log(`${status} ${cat.category_name}`);
          console.log(`   Total: ${cat.total_quantity} | Unique Cards: ${cat.unique_cards}`);
          if (cat.minimum_stock_level > 0) {
            console.log(`   Min Stock: ${cat.minimum_stock_level}`);
          }
          console.log('');
        }
        break;

      default:
        console.log('Usage:');
        console.log('  node check-stock-alerts.js check <user-id>           - Check category stock alerts');
        console.log('  node check-stock-alerts.js low <user-id> [threshold] - List low stock items');
        console.log('  node check-stock-alerts.js stats <user-id>           - Show inventory statistics');
        console.log('  node check-stock-alerts.js summary <user-id>         - Show category summary');
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
  getCategories,
  getInventorySummaryByCategory,
  checkStockAlerts,
  getLowStockItems,
  getInventoryStats,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
