const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    const db = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'elevate_db',
    });

    console.log('Adding details column to aptitude_results table...');
    // Check if column already exists
    const [cols] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`,
      [process.env.DB_NAME || 'elevate_db', 'aptitude_results', 'details']
    );
    
    if (cols.length === 0) {
      await db.execute('ALTER TABLE aptitude_results ADD COLUMN details TEXT NULL');
      console.log('Successfully added details column!');
    } else {
      console.log('details column already exists.');
    }
    
    await db.end();
  } catch (err) {
    console.error('Database migration failed:', err.message);
    process.exit(1);
  }
})();
