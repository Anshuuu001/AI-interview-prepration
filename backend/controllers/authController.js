const db = require('../utils/mysql');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id');

// ─── Helpers ────────────────────────────────────────────────────────────────

const safeUser = (u) => {
  const { password, verification_code, verification_code_expires, ...safe } = u;
  if (typeof safe.skills === 'string') {
    try { safe.skills = JSON.parse(safe.skills); } catch { safe.skills = safe.skills.split(',').map(s => s.trim()).filter(Boolean); }
  }
  safe.isLocked = !!((safe.lockout_until && safe.lockout_until > Date.now()) || (safe.suspended_until && safe.suspended_until > Date.now()));
  // Remap DB column names to camelCase for frontend compatibility
  return {
    id: safe.id, name: safe.name, email: safe.email, role: safe.role,
    title: safe.title, skills: safe.skills || [], bio: safe.bio || '',
    readinessScore: safe.readiness_score || 0,
    resumeScore: safe.resume_score || 0,
    aptitudeScore: safe.aptitude_score || 0,
    failedAttempts: safe.failed_attempts || 0,
    lockoutUntil: safe.lockout_until || null,
    suspendedUntil: safe.suspended_until || null,
    suspendedReason: safe.suspended_reason || null,
    isBanned: !!safe.is_banned,
    sessionId: safe.session_id || null,
    avatar: safe.avatar || null,
    isLocked: safe.isLocked,
  };
};

const ensureDefaultUsers = async () => {
  const defaults = [
    { id: '1', name: 'Alex Johnson', email: 'student@elevateai.com', password: 'password123', role: 'student', title: 'Full Stack Engineer Intern', skills: JSON.stringify(['React', 'Node.js', 'CSS', 'JavaScript']), bio: 'Aspiring software developer passionate about building high-fidelity client applications.' },
    { id: '2', name: 'Admin user', email: 'admin@elevateai.com', password: 'admin', role: 'admin', title: 'Head of Talent Acquisition', skills: JSON.stringify(['Recruiting', 'Management', 'HR Tech']), bio: 'Managing the AI question banks and reviewing applicant preparation portfolios.' }
  ];
  for (const u of defaults) {
    await db.execute(
      `INSERT IGNORE INTO users (id, name, email, password, role, title, skills, bio) VALUES (?,?,?,?,?,?,?,?)`,
      [u.id, u.name, u.email, u.password, u.role, u.title, u.skills, u.bio]
    );
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    await ensureDefaultUsers();
    const { email, password, deviceId, rememberDevice } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const user = rows[0];

    if (user.is_banned) return res.status(403).json({ error: 'This account has been permanently banned due to integrity violations.' });

    if (user.lockout_until && user.lockout_until > Date.now()) {
      const minutesLeft = Math.ceil((user.lockout_until - Date.now()) / (60 * 1000));
      return res.status(403).json({ error: `Account locked due to 5 failed login attempts. Try again in ${minutesLeft} minutes.` });
    }

    if (user.suspended_until && user.suspended_until > Date.now()) {
      const timeLeft = Math.ceil((user.suspended_until - Date.now()) / (60 * 1000));
      return res.status(403).json({ error: `Account suspended due to proctoring violation. Please try again in ${timeLeft} minutes.` });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown Device';

    if (user.password !== password) {
      const newAttempts = (user.failed_attempts || 0) + 1;
      let lockoutUntil = null;
      if (newAttempts >= 5) {
        lockoutUntil = Date.now() + 30 * 60 * 1000;
        console.log(`\n[ALERT] Account locked for 30 minutes: ${email}, IP: ${ip}`);
        await db.execute('UPDATE users SET failed_attempts=0, lockout_until=? WHERE id=?', [lockoutUntil, user.id]);
        await db.execute('INSERT INTO login_history (user_id, timestamp, ip, device, status, suspicious) VALUES (?,?,?,?,?,?)',
          [user.id, Date.now(), ip, device, 'locked', false]);
        return res.status(403).json({ error: 'Account locked due to multiple failed login attempts.' });
      }
      await db.execute('UPDATE users SET failed_attempts=? WHERE id=?', [newAttempts, user.id]);
      await db.execute('INSERT INTO login_history (user_id, timestamp, ip, device, status, suspicious) VALUES (?,?,?,?,?,?)',
        [user.id, Date.now(), ip, device, 'failed', false]);
      const attemptsRemaining = 5 - newAttempts;
      return res.status(401).json({ error: `Invalid email or password. ${attemptsRemaining} attempts remaining.` });
    }

    // Password correct
    await db.execute('UPDATE users SET failed_attempts=0, lockout_until=NULL WHERE id=?', [user.id]);

    // Suspicious login detection
    const [lastSuccess] = await db.execute(
      'SELECT ip, device FROM login_history WHERE user_id=? AND status="success" ORDER BY timestamp DESC LIMIT 1',
      [user.id]
    );
    let suspicious = false;
    if (lastSuccess.length > 0 && (lastSuccess[0].ip !== ip || lastSuccess[0].device !== device)) {
      suspicious = true;
    }

    // Check remembered device
    const [deviceRows] = await db.execute('SELECT device_id FROM user_devices WHERE user_id=? AND device_id=?', [user.id, deviceId || '']);
    const isDeviceRemembered = deviceRows.length > 0;
    const isDemoAccount = email === 'student@elevateai.com' || email === 'admin@elevateai.com';

    if (suspicious && !isDeviceRemembered && !isDemoAccount) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 10 * 60 * 1000;
      console.log(`\n[ALERT] Suspicious login verification code for ${email}: ${verificationCode}`);
      await db.execute('UPDATE users SET verification_code=?, verification_code_expires=? WHERE id=?', [verificationCode, expires, user.id]);
      const tempToken = jwt.sign({ id: user.id, temp: true }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '10m' });
      return res.json({ verificationRequired: true, tempToken, email: user.email });
    }

    const sessionId = Math.random().toString(36).substring(2, 15);
    await db.execute('UPDATE users SET session_id=? WHERE id=?', [sessionId, user.id]);

    if (rememberDevice && deviceId) {
      await db.execute('INSERT IGNORE INTO user_devices (user_id, device_id) VALUES (?,?)', [user.id, deviceId]);
    }

    await db.execute('INSERT INTO login_history (user_id, timestamp, ip, device, status, suspicious) VALUES (?,?,?,?,?,?)',
      [user.id, Date.now(), ip, device, 'success', suspicious]);

    const token = jwt.sign({ id: user.id, role: user.role, sessionId }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '7d' });
    const [fresh] = await db.execute('SELECT * FROM users WHERE id=?', [user.id]);
    res.json({ user: safeUser(fresh[0]), token });

  } catch (err) {
    console.error('[login error]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── Verify Device Code ──────────────────────────────────────────────────────

const verifyDeviceCode = async (req, res) => {
  const { code, tempToken, deviceId, rememberDevice } = req.body;
  if (!tempToken || !code) return res.status(400).json({ error: 'Missing code or session token' });

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'dev-secret-key');
    if (!decoded.temp) return res.status(401).json({ error: 'Invalid token' });

    const [rows] = await db.execute('SELECT * FROM users WHERE id=?', [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];

    if (!user.verification_code || user.verification_code !== code) return res.status(400).json({ error: 'Invalid verification code' });
    if (!user.verification_code_expires || user.verification_code_expires < Date.now()) return res.status(400).json({ error: 'Verification code has expired' });

    await db.execute('UPDATE users SET verification_code=NULL, verification_code_expires=NULL WHERE id=?', [user.id]);

    if (rememberDevice && deviceId) {
      await db.execute('INSERT IGNORE INTO user_devices (user_id, device_id) VALUES (?,?)', [user.id, deviceId]);
    }

    const sessionId = Math.random().toString(36).substring(2, 15);
    await db.execute('UPDATE users SET session_id=? WHERE id=?', [sessionId, user.id]);

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown Device';
    await db.execute('INSERT INTO login_history (user_id, timestamp, ip, device, status, suspicious) VALUES (?,?,?,?,?,?)',
      [user.id, Date.now(), ip, device, 'success', false]);

    const token = jwt.sign({ id: user.id, role: user.role, sessionId }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '7d' });
    const [fresh] = await db.execute('SELECT * FROM users WHERE id=?', [user.id]);
    res.json({ user: safeUser(fresh[0]), token });

  } catch (err) {
    return res.status(401).json({ error: 'Verification session expired. Please log in again.' });
  }
};

// ─── Register ────────────────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    await ensureDefaultUsers();
    const { name, email, password, role } = req.body;
    const [existing] = await db.execute('SELECT id FROM users WHERE email=?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'An account with this email already exists' });

    const newId = `user-${Date.now()}`;
    const userRole = role || 'student';
    const title = userRole === 'admin' ? 'Recruiting Admin' : 'Graduate Candidate';
    const sessionId = Math.random().toString(36).substring(2, 15);

    await db.execute(
      'INSERT INTO users (id, name, email, password, role, title, bio, session_id) VALUES (?,?,?,?,?,?,?,?)',
      [newId, name, email, password, userRole, title, 'New candidate profile.', sessionId]
    );

    const token = jwt.sign({ id: newId, role: userRole, sessionId }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '7d' });
    const [fresh] = await db.execute('SELECT * FROM users WHERE id=?', [newId]);
    res.status(201).json({ user: safeUser(fresh[0]), token });

  } catch (err) {
    console.error('[register error]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── Google Login ────────────────────────────────────────────────────────────

const googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    await ensureDefaultUsers();
    let email, name, picture;

    if (typeof credential === 'object' && credential !== null) {
      email = credential.email; name = credential.name; picture = credential.photoURL;
    } else {
      let payload = null;
      if (!process.env.GOOGLE_CLIENT_ID) {
        payload = jwt.decode(credential);
        if (!payload) throw new Error('Invalid token format');
      } else {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
      }
      email = payload.email; name = payload.name; picture = payload.picture;
    }

    const [rows] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
    let user;

    if (rows.length === 0) {
      const newId = `user-${Date.now()}`;
      await db.execute(
        'INSERT INTO users (id, name, email, password, role, title, bio, avatar) VALUES (?,?,?,?,?,?,?,?)',
        [newId, name, email, `google-${Date.now()}`, 'student', 'Candidate Profile (Google)', 'New candidate profile created via Google Sign-In.', picture || null]
      );
      const [fresh] = await db.execute('SELECT * FROM users WHERE id=?', [newId]);
      user = fresh[0];
    } else {
      user = rows[0];
    }

    if (user.is_banned) return res.status(403).json({ error: 'This account has been permanently banned due to integrity violations.' });
    if (user.suspended_until && user.suspended_until > Date.now()) {
      const timeLeft = Math.ceil((user.suspended_until - Date.now()) / (60 * 1000));
      return res.status(403).json({ error: `Account suspended. Please try again in ${timeLeft} minutes.` });
    }

    const sessionId = Math.random().toString(36).substring(2, 15);
    await db.execute('UPDATE users SET session_id=? WHERE id=?', [sessionId, user.id]);

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown Device';
    await db.execute('INSERT INTO login_history (user_id, timestamp, ip, device, status, suspicious) VALUES (?,?,?,?,?,?)',
      [user.id, Date.now(), ip, device, 'success', false]);

    const token = jwt.sign({ id: user.id, role: user.role, sessionId }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '7d' });
    const [fresh] = await db.execute('SELECT * FROM users WHERE id=?', [user.id]);
    res.json({ user: safeUser(fresh[0]), token });

  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// ─── Suspend / Extend / Ban / Unlock ────────────────────────────────────────

const suspendAccount = async (req, res) => {
  try {
    const { userId, reason, warnings, ip, device, browser, os } = req.body;
    const startTime = Date.now();
    const endTime = startTime + 30 * 60 * 1000;
    const suspendedReason = reason || 'Proctoring violations exceeded limit.';

    await db.execute('UPDATE users SET suspended_until=?, suspended_reason=? WHERE id=?', [endTime, suspendedReason, userId]);
    await db.execute(
      'INSERT INTO suspension_history (user_id, start_time, end_time, reason, warnings_count, ip, device, browser, os, status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
        userId, 
        startTime, 
        endTime, 
        suspendedReason, 
        warnings || 5, 
        (ip || req.ip || 'Unknown').substring(0, 45), 
        (device || 'Unknown').substring(0, 255), 
        (browser || 'Unknown').substring(0, 255), 
        (os || 'Unknown').substring(0, 255), 
        'active'
      ]
    );
    res.json({ success: true, suspendedUntil: endTime });
  } catch (err) {
    console.error('[suspendAccount error]', err.message);
    res.status(500).json({ error: 'Failed to suspend account' });
  }
};

const extendSuspension = async (req, res) => {
  try {
    const { userId } = req.body;
    const [rows] = await db.execute('SELECT suspended_until FROM users WHERE id=?', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const current = rows[0].suspended_until || Date.now();
    const newEnd = current + 30 * 60 * 1000;
    await db.execute('UPDATE users SET suspended_until=? WHERE id=?', [newEnd, userId]);
    await db.execute('UPDATE suspension_history SET end_time=?, reason=CONCAT(reason, " (Extended by Admin)") WHERE user_id=? ORDER BY id DESC LIMIT 1', [newEnd, userId]);
    res.json({ success: true, suspendedUntil: newEnd });
  } catch (err) {
    console.error('[extendSuspension error]', err.message);
    res.status(500).json({ error: 'Failed to extend suspension' });
  }
};

const banUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const permanentLock = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;
    await db.execute('UPDATE users SET is_banned=TRUE, suspended_until=?, suspended_reason=? WHERE id=?',
      [permanentLock, 'Permanently banned due to severe integrity violations.', userId]);
    res.json({ success: true, message: 'User permanently banned' });
  } catch (err) {
    console.error('[banUser error]', err.message);
    res.status(500).json({ error: 'Failed to ban user' });
  }
};

const unlockAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    await db.execute('UPDATE users SET failed_attempts=0, lockout_until=NULL, suspended_until=NULL, suspended_reason=NULL, is_banned=FALSE WHERE id=?', [userId]);
    res.json({ success: true, message: 'Account successfully unlocked' });
  } catch (err) {
    console.error('[unlockAccount error]', err.message);
    res.status(500).json({ error: 'Failed to unlock account' });
  }
};

// ─── Admin: List / Toggle Role ───────────────────────────────────────────────

const getUsersList = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users');
    res.json(rows.map(safeUser));
  } catch (err) {
    console.error('[getUsersList error]', err.message);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
};

const toggleUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const [rows] = await db.execute('SELECT role FROM users WHERE id=?', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    let newRole = role;
    if (!newRole) {
      newRole = rows[0].role === 'admin' ? 'student' : 'admin';
    }
    
    let newTitle = 'Graduate Candidate';
    if (newRole === 'admin') newTitle = 'Recruiting Admin';
    else if (newRole === 'hr') newTitle = 'HR Manager';
    else if (newRole === 'recruiter') newTitle = 'Talent Recruiter';
    else if (newRole === 'trainer') newTitle = 'Technical Trainer';
    else if (newRole === 'moderator') newTitle = 'Platform Moderator';
    else if (newRole === 'support') newTitle = 'Support Specialist';
    
    await db.execute('UPDATE users SET role=?, title=? WHERE id=?', [newRole, newTitle, userId]);
    res.json({ success: true, role: newRole, title: newTitle });
  } catch (err) {
    console.error('[toggleUserRole error]', err.message);
    res.status(500).json({ error: 'Failed to toggle user role' });
  }
};

// ─── Update Profile ─────────────────────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    const { name, title, bio, skills } = req.body;
    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);
    await db.execute(
      'UPDATE users SET name=?, title=?, bio=?, skills=? WHERE id=?',
      [name, title, bio, skillsJson, req.user.id]
    );
    const [rows] = await db.execute('SELECT * FROM users WHERE id=?', [req.user.id]);
    res.json({ success: true, user: safeUser(rows[0]) });
  } catch (err) {
    console.error('[updateProfile error]', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  login,
  verifyDeviceCode,
  register,
  googleLogin,
  suspendAccount,
  extendSuspension,
  banUser,
  unlockAccount,
  getUsersList,
  toggleUserRole,
  updateProfile
};
