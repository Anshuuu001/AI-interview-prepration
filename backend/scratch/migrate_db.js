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

    console.log('Modifying columns in suspension_history table...');
    await db.execute('ALTER TABLE suspension_history MODIFY COLUMN browser VARCHAR(255) NOT NULL');
    await db.execute('ALTER TABLE suspension_history MODIFY COLUMN os VARCHAR(255) NOT NULL');
    console.log('Successfully updated database column constraints!');
    await db.end();
  } catch (err) {
    console.error('Database migration failed:', err.message);
    process.exit(1);
  }
})();
