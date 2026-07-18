require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'elevate_db',
  });

  // Helper: add column only if it doesn't already exist
  const addColumn = async (table, column, definition) => {
    const [rows] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`,
      [process.env.DB_NAME || 'elevate_db', table, column]
    );
    if (rows.length === 0) {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Added: ${table}.${column}`);
    } else {
      console.log(`Exists: ${table}.${column}`);
    }
  };

  try {
    await addColumn('users', 'verification_code',         'VARCHAR(10) DEFAULT NULL');
    await addColumn('users', 'verification_code_expires', 'BIGINT DEFAULT NULL');
    await addColumn('users', 'avatar',                    'TEXT DEFAULT NULL');
  } catch (e) {
    console.error('Migration error:', e.message);
  }

  await db.end();
  console.log('Schema migration complete.');
})();
