const mysql = require('mysql2/promise');

// Create a connection pool for efficient query execution
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'elevate_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('[MySQL] Connected to elevate_db successfully.');
    conn.release();
  })
  .catch(err => {
    console.error('[MySQL] Connection FAILED:', err.message);
    console.error('[MySQL] Falling back to JSON file storage.');
  });

module.exports = pool;
