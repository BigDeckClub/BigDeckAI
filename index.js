/**
 * BigDeckApp - MTG Card Inventory Tracker
 * Main entry point
 */

const express = require('express');
const db = require('./database/connection');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthy = await db.healthCheck();
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'BigDeckApp',
    description: 'MTG Card Inventory Tracker',
    version: '1.0.0',
    endpoints: {
      health: '/health',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎴 BigDeckApp server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down...');
  await db.close();
  process.exit(0);
});
