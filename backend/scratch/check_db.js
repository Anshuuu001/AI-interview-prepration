const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'elevate_db',
});

pool.query('DESCRIBE suspension_history', (err, rows) => {
  if (err) {
    console.error('Failed to describe suspension_history table:', err.message);
    process.exit(1);
  } else {
    console.log('Columns in suspension_history table:');
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
    process.exit(0);
  }
});
