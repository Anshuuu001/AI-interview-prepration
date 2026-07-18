const jwt = require('jsonwebtoken');
const db = require('../utils/mysql');
const { readData } = require('../utils/db');

const USERS_FILE = 'users.json';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');

    // Reject temporary device-verification tokens
    if (decoded.temp) {
      return res.status(401).json({ error: 'This action is unauthorized. Please verify your device first.' });
    }

    // Look up user in MySQL first, fall back to JSON file if DB not available
    let user = null;
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);
      if (rows.length > 0) {
        const u = rows[0];
        user = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          title: u.title,
          bio: u.bio,
          skills: (() => {
            try { return JSON.parse(u.skills || '[]'); } catch { return (u.skills || '').split(',').map(s => s.trim()).filter(Boolean); }
          })(),
          sessionId: u.session_id,
          isBanned: !!u.is_banned,
          suspendedUntil: u.suspended_until,
          lockoutUntil: u.lockout_until,
          readinessScore: u.readiness_score || 0,
          resumeScore: u.resume_score || 0,
          aptitudeScore: u.aptitude_score || 0,
        };
      }
    } catch (dbErr) {
      // MySQL unavailable — fall back to JSON users file
      console.warn('[authMiddleware] MySQL unavailable, falling back to JSON:', dbErr.message);
      const users = readData(USERS_FILE, []);
      user = users.find(u => u.id === decoded.id);
    }

    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }

    // Single-session check: sessionId in token must match DB value
    if (user.sessionId && decoded.sessionId && decoded.sessionId !== user.sessionId) {
      return res.status(401).json({ error: 'Session invalidated. You have logged in from another location.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    next(err); // Pass unexpected errors to Express error handler
  }
};


const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};
