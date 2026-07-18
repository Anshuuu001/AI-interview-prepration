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

    console.log('Updating admin user password in MySQL database to "admin"...');
    await db.execute(
      "UPDATE users SET name='Admin user', email='admin@elevateai.com', password='admin' WHERE id='2'"
    );
    console.log('Successfully updated admin credentials in MySQL database!');
    await db.end();
  } catch (err) {
    console.error('Failed to update admin credentials in database:', err.message);
  }
})();
