/**
 * BigDeckApp - MTG Card Inventory Tracker
 * Main application entry point
 *
 * @module index
 * @description Express server with health monitoring, request logging,
 * CORS support, and graceful shutdown handling.
 */

const express = require('express');
const db = require('./database/connection');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

/**
 * Parse JSON request bodies
 * Limit set to 10kb to prevent large payload attacks
 */
app.use(express.json({ limit: '10kb' }));

/**
 * Parse URL-encoded request bodies
 */
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * CORS Configuration Middleware
 * Configures Cross-Origin Resource Sharing based on environment
 */
app.use((req, res, next) => {
  const allowedOrigins = process.env.CORS_ORIGIN || '*';

  if (allowedOrigins === '*') {
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    const origins = allowedOrigins.split(',').map((o) => o.trim());
    const origin = req.headers.origin;
    if (origins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

/**
 * Request Logging Middleware
 * Logs incoming requests with timing information
 */
app.use((req, res, next) => {
  const shouldLog =
    process.env.LOG_REQUESTS === 'true' || (process.env.NODE_ENV === 'development' && process.env.LOG_REQUESTS !== 'false');

  if (shouldLog) {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Log request start
    db.logger.info(`[${requestId}] ${req.method} ${req.path}`, {
      query: Object.keys(req.query).length ? req.query : undefined,
      ip: req.ip || req.connection.remoteAddress,
    });

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      db.logger.info(`[${requestId}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
  }

  next();
});

/**
 * Simple in-memory rate limiter
 * Tracks requests per IP address
 */
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

/**
 * Rate Limiting Middleware
 * Limits requests per IP address within a time window
 */
app.use((req, res, next) => {
  // Skip rate limiting for health checks
  if (req.path === '/health' || req.path === '/health/detailed') {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Get or create rate limit entry for this IP
  let entry = rateLimitStore.get(ip);
  if (!entry || entry.windowStart < windowStart) {
    entry = { count: 0, windowStart: now };
  }

  entry.count++;
  rateLimitStore.set(ip, entry);

  // Set rate limit headers
  res.header('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.header('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - entry.count));
  res.header('X-RateLimit-Reset', new Date(entry.windowStart + RATE_LIMIT_WINDOW).toISOString());

  if (entry.count > RATE_LIMIT_MAX) {
    db.logger.warn('Rate limit exceeded', { ip, count: entry.count });
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW - now) / 1000),
    });
  }

  next();
});

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.windowStart < windowStart) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// =============================================================================
// API ENDPOINTS
// =============================================================================

/**
 * @api {get} / Root Endpoint
 * @apiName GetRoot
 * @apiGroup General
 * @apiDescription Returns API information and available endpoints
 *
 * @apiSuccess {String} name Application name
 * @apiSuccess {String} description Application description
 * @apiSuccess {String} version Application version
 * @apiSuccess {Object} endpoints Available API endpoints
 */
app.get('/', (req, res) => {
  res.json({
    name: 'BigDeckApp',
    description: 'MTG Card Inventory Tracker',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: {
        path: '/health',
        method: 'GET',
        description: 'Basic health check',
      },
      healthDetailed: {
        path: '/health/detailed',
        method: 'GET',
        description: 'Detailed health status with database info',
      },
      apiDocs: {
        path: '/api/docs',
        method: 'GET',
        description: 'API documentation',
      },
    },
  });
});

/**
 * @api {get} /health Basic Health Check
 * @apiName HealthCheck
 * @apiGroup Health
 * @apiDescription Returns basic health status of the application
 *
 * @apiSuccess {String} status Health status (healthy/unhealthy)
 * @apiSuccess {String} timestamp ISO timestamp of the check
 */
app.get('/health', async (req, res) => {
  try {
    const healthy = await db.healthCheck();
    const statusCode = healthy ? 200 : 503;

    res.status(statusCode).json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    db.logger.error('Health check error', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

/**
 * @api {get} /health/detailed Detailed Health Check
 * @apiName DetailedHealthCheck
 * @apiGroup Health
 * @apiDescription Returns detailed health status including database info and uptime
 *
 * @apiSuccess {String} status Health status
 * @apiSuccess {String} timestamp ISO timestamp
 * @apiSuccess {Number} uptime Application uptime in seconds
 * @apiSuccess {Object} database Database health information
 * @apiSuccess {Object} system System information
 */
app.get('/health/detailed', async (req, res) => {
  try {
    const healthStatus = await db.getHealthStatus();
    const dbVersion = await db.getDatabaseVersion();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    const status = healthStatus.healthy ? 'healthy' : 'degraded';
    const statusCode = healthStatus.healthy ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: formatUptime(uptimeSeconds),
      },
      database: {
        connected: healthStatus.connectionEstablished,
        healthy: healthStatus.healthy,
        version: dbVersion.version,
        pool: healthStatus.pool,
        lastCheck: healthStatus.lastHealthCheck,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        },
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    db.logger.error('Detailed health check error', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * @api {get} /api/docs API Documentation
 * @apiName APIDocs
 * @apiGroup General
 * @apiDescription Returns complete API documentation
 */
app.get('/api/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'BigDeckApp API',
      version: '1.0.0',
      description: 'MTG Card Inventory Tracker API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    paths: {
      '/': {
        get: {
          summary: 'Root endpoint',
          description: 'Returns API information and available endpoints',
          responses: {
            200: { description: 'API information' },
          },
        },
      },
      '/health': {
        get: {
          summary: 'Basic health check',
          description: 'Returns basic health status',
          responses: {
            200: { description: 'Application is healthy' },
            503: { description: 'Application is unhealthy' },
          },
        },
      },
      '/health/detailed': {
        get: {
          summary: 'Detailed health check',
          description: 'Returns detailed health status with database info',
          responses: {
            200: { description: 'Detailed health information' },
            503: { description: 'Application is unhealthy' },
          },
        },
      },
    },
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  db.logger.error('Unhandled error', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format uptime seconds into human-readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

// =============================================================================
// SERVER STARTUP
// =============================================================================

const server = app.listen(PORT, () => {
  db.logger.info(`🎴 BigDeckApp server running on port ${PORT}`);
  db.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize database connection
  db.initializeWithRetry(3)
    .then((connected) => {
      if (!connected) {
        db.logger.warn('Database connection not available at startup');
      }
    })
    .catch((err) => {
      db.logger.error('Database initialization error', { error: err.message });
    });
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

/**
 * Graceful shutdown handler
 * @param {string} signal - Signal that triggered shutdown
 */
async function gracefulShutdown(signal) {
  db.logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    db.logger.info('HTTP server closed');

    try {
      // Close database connections
      await db.close();
      db.logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      db.logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    db.logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  db.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  db.logger.error('Unhandled rejection', { reason: reason?.message || reason });
});

module.exports = app;
