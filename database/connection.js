/**
 * BigDeckApp Database Connection Module
 * PostgreSQL connection with connection pooling, retry logic, and health monitoring
 * @module database/connection
 */

const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

/**
 * Logger utility for consistent logging across the module
 * @private
 */
const logger = {
  /**
   * Log info level message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  info: (message, meta = {}) => {
    const level = process.env.LOG_LEVEL || 'info';
    if (['debug', 'info'].includes(level)) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  },
  /**
   * Log error level message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
  },
  /**
   * Log warning level message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  warn: (message, meta = {}) => {
    const level = process.env.LOG_LEVEL || 'info';
    if (['debug', 'info', 'warn'].includes(level)) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  },
  /**
   * Log debug level message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  debug: (message, meta = {}) => {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  },
};

/**
 * Parse integer from environment variable with fallback
 * @private
 * @param {string} envVar - Environment variable value
 * @param {number} defaultValue - Default value if parsing fails
 * @param {number} [min] - Minimum allowed value
 * @param {number} [max] - Maximum allowed value
 * @returns {number} Parsed integer value
 */
function parseIntEnv(envVar, defaultValue, min = 0, max = Infinity) {
  const parsed = parseInt(envVar, 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Build SSL configuration based on environment variables
 * @private
 * @returns {boolean|Object} SSL configuration or false if disabled
 */
function buildSSLConfig() {
  if (process.env.DATABASE_SSL !== 'true') {
    return false;
  }

  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

/**
 * Database configuration object
 * @type {Object}
 */
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: buildSSLConfig(),
  // Pool sizing - optimized for Replit's resource constraints
  max: parseIntEnv(process.env.DATABASE_POOL_MAX, 10, 1, 100),
  min: parseIntEnv(process.env.DATABASE_POOL_MIN, 2, 0, 50),
  // Timeout configuration
  idleTimeoutMillis: parseIntEnv(process.env.DATABASE_IDLE_TIMEOUT, 30000, 1000, 300000),
  connectionTimeoutMillis: parseIntEnv(process.env.DATABASE_CONNECTION_TIMEOUT, 5000, 1000, 60000),
  // Additional configuration for stability
  statement_timeout: parseIntEnv(process.env.DATABASE_STATEMENT_TIMEOUT, 30000, 0, 300000),
  query_timeout: parseIntEnv(process.env.DATABASE_STATEMENT_TIMEOUT, 30000, 0, 300000),
  // Keep-alive settings for long-running connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Create connection pool
const pool = new Pool(config);

// Connection state tracking
let connectionEstablished = false;
let lastHealthCheck = null;
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 5;

// Connection event handlers
pool.on('connect', (client) => {
  connectionEstablished = true;
  consecutiveFailures = 0;
  logger.info('Database connection established');

  // Set statement timeout on new connections
  if (config.statement_timeout > 0) {
    client.query(`SET statement_timeout = ${config.statement_timeout}`).catch((err) => {
      logger.warn('Failed to set statement timeout', { error: err.message });
    });
  }
});

pool.on('error', (err, client) => {
  consecutiveFailures++;
  logger.error('Unexpected database pool error', {
    error: err.message,
    code: err.code,
    consecutiveFailures,
  });

  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    logger.error('Maximum consecutive failures reached, pool may be unhealthy');
  }
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

/**
 * Sleep utility for retry delays
 * @private
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 * @private
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
function calculateBackoff(attempt, baseDelay = 1000, maxDelay = 30000) {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (±25%) to prevent thundering herd
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Execute a query with parameters and optional retry logic
 * @param {string} text - SQL query text
 * @param {Array} [params] - Query parameters
 * @param {Object} [options] - Query options
 * @param {number} [options.retries=0] - Number of retries on transient failures
 * @param {number} [options.timeout] - Query timeout in milliseconds
 * @returns {Promise<Object>} Query result
 * @throws {Error} If query fails after all retries
 */
async function query(text, params = [], options = {}) {
  const { retries = 0, timeout } = options;
  const start = Date.now();
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const queryConfig = { text, values: params };
      if (timeout) {
        queryConfig.query_timeout = timeout;
      }

      const result = await pool.query(queryConfig);
      const duration = Date.now() - start;

      logger.debug('Executed query', {
        text: text.substring(0, 100),
        duration,
        rows: result.rowCount,
        attempt: attempt > 0 ? attempt + 1 : undefined,
      });

      return result;
    } catch (error) {
      lastError = error;
      const duration = Date.now() - start;

      // Check if error is retryable
      const isRetryable = isRetryableError(error);

      logger.error('Database query error', {
        text: text.substring(0, 100),
        error: error.message,
        code: error.code,
        duration,
        attempt: attempt + 1,
        willRetry: isRetryable && attempt < retries,
      });

      if (isRetryable && attempt < retries) {
        const backoffDelay = calculateBackoff(attempt);
        logger.info(`Retrying query in ${backoffDelay}ms...`);
        await sleep(backoffDelay);
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable
 * @private
 * @param {Error} error - Database error
 * @returns {boolean} True if the error is retryable
 */
function isRetryableError(error) {
  // PostgreSQL error codes that are typically transient
  const retryableCodes = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '57P01', // admin_shutdown
    '57P02', // crash_shutdown
    '57P03', // cannot_connect_now
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '55P03', // lock_not_available
  ];

  return (
    retryableCodes.includes(error.code) ||
    error.message.includes('Connection terminated') ||
    error.message.includes('connection timeout') ||
    error.message.includes('ECONNRESET') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ENOTFOUND')
  );
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client with release method
 * @throws {Error} If unable to acquire a client
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout of 30 seconds, after which we log a warning
  const warningTimeout = setTimeout(() => {
    logger.warn('Client has been checked out for more than 30 seconds', {
      lastQuery: client.lastQuery ? client.lastQuery[0]?.substring(0, 100) : 'unknown',
    });
  }, 30000);

  // Monkey patch the query method to track the last query
  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery(...args);
  };

  client.release = () => {
    clearTimeout(warningTimeout);
    client.query = originalQuery;
    client.release = release;
    return release();
  };

  return client;
}

/**
 * Execute a transaction with automatic rollback on error
 * @param {Function} callback - Async function that receives the client
 * @returns {Promise<any>} Result of the callback
 * @throws {Error} If transaction fails (will be rolled back)
 * @example
 * const result = await transaction(async (client) => {
 *   await client.query('INSERT INTO users (name) VALUES ($1)', ['John']);
 *   await client.query('INSERT INTO logs (action) VALUES ($1)', ['created user']);
 *   return { success: true };
 * });
 */
async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if the database connection is healthy
 * @returns {Promise<boolean>} True if healthy
 */
async function healthCheck() {
  try {
    const result = await query('SELECT 1 AS health', [], { timeout: 5000 });
    lastHealthCheck = { healthy: true, timestamp: new Date() };
    consecutiveFailures = 0;
    return result.rows[0].health === 1;
  } catch (error) {
    lastHealthCheck = { healthy: false, timestamp: new Date(), error: error.message };
    logger.error('Database health check failed', { error: error.message });
    return false;
  }
}

/**
 * Get detailed health status including pool statistics
 * @returns {Promise<Object>} Health status object
 */
async function getHealthStatus() {
  const healthy = await healthCheck();

  return {
    healthy,
    connectionEstablished,
    lastHealthCheck,
    consecutiveFailures,
    pool: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    },
    config: {
      max: config.max,
      min: config.min,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    },
  };
}

/**
 * Get database version information
 * @returns {Promise<Object>} Database version info
 */
async function getDatabaseVersion() {
  try {
    const result = await query('SELECT version() AS version');
    return { version: result.rows[0].version };
  } catch (error) {
    logger.error('Failed to get database version', { error: error.message });
    return { version: 'unknown', error: error.message };
  }
}

/**
 * Close all pool connections
 * @returns {Promise<void>}
 */
async function close() {
  logger.info('Closing database pool...');
  await pool.end();
  logger.info('Database pool closed');
}

/**
 * Initialize connection with retry logic
 * Useful for startup when database might not be immediately available
 * @param {number} [maxRetries=5] - Maximum number of connection attempts
 * @returns {Promise<boolean>} True if connection successful
 */
async function initializeWithRetry(maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const healthy = await healthCheck();
      if (healthy) {
        logger.info('Database connection initialized successfully');
        return true;
      }
    } catch (error) {
      logger.warn(`Connection attempt ${attempt + 1}/${maxRetries} failed`, {
        error: error.message,
      });
    }

    if (attempt < maxRetries - 1) {
      const backoffDelay = calculateBackoff(attempt);
      logger.info(`Retrying connection in ${backoffDelay}ms...`);
      await sleep(backoffDelay);
    }
  }

  logger.error('Failed to initialize database connection after all retries');
  return false;
}

module.exports = {
  query,
  getClient,
  transaction,
  healthCheck,
  getHealthStatus,
  getDatabaseVersion,
  close,
  initializeWithRetry,
  pool,
  logger,
};
