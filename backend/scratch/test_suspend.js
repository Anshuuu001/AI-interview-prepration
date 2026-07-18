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

    const userId = '1'; // default student user ID
    const startTime = Date.now();
    const endTime = startTime + 30 * 60 * 1000;
    const suspendedReason = 'Automated Proctor lockout test';
    
    console.log('Testing UPDATE users...');
    await db.execute('UPDATE users SET suspended_until=?, suspended_reason=? WHERE id=?', [endTime, suspendedReason, userId]);
    
    console.log('Testing INSERT INTO suspension_history...');
    await db.execute(
      'INSERT INTO suspension_history (user_id, start_time, end_time, reason, warnings_count, ip, device, browser, os, status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [userId, startTime, endTime, suspendedReason, 5, '127.0.0.1', 'TestDevice', 'Chrome', 'Windows', 'active']
    );
    console.log('Success executing queries!');
    await db.end();
  } catch (err) {
    console.error('Database test failed:', err.message);
    process.exit(1);
  }
})();
