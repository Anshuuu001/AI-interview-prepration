const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'elevate_db',
  });

  // 1. Show current status of all users
  const [rows] = await db.execute('SELECT id, name, email, password, role, is_banned, suspended_until, lockout_until, failed_attempts FROM users');
  console.log('=== Current User Statuses ===');
  for (const r of rows) {
    console.log(`  [${r.id}] ${r.name} (${r.email}) role=${r.role} banned=${r.is_banned} suspended_until=${r.suspended_until} lockout_until=${r.lockout_until} failed_attempts=${r.failed_attempts}`);
  }

  // 2. Clear ALL locks, bans, and suspensions for every user
  console.log('\n=== Clearing all locks, bans, suspensions ===');
  await db.execute('UPDATE users SET is_banned=0, suspended_until=NULL, lockout_until=NULL, failed_attempts=0');

  // 3. Make sure admin password is 'admin'
  await db.execute("UPDATE users SET password='admin' WHERE id='2'");

  // 4. Verify
  const [after] = await db.execute('SELECT id, name, email, password, role, is_banned, suspended_until, lockout_until, failed_attempts FROM users');
  console.log('\n=== After Fix ===');
  for (const r of after) {
    console.log(`  [${r.id}] ${r.name} (${r.email}) role=${r.role} banned=${r.is_banned} suspended_until=${r.suspended_until} lockout_until=${r.lockout_until} failed_attempts=${r.failed_attempts}`);
  }

  await db.end();
  console.log('\nDone! All accounts are now unlocked and accessible.');
})();
