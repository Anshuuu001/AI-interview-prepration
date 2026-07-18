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

    console.log('Querying users...');
    const [rows] = await db.execute('SELECT id, name, email, role, session_id FROM users');
    console.log('Users in MySQL:', JSON.stringify(rows, null, 2));
    await db.end();
  } catch (err) {
    console.error('Database query failed:', err.message);
  }
})();
