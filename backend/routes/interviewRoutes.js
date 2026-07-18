const express = require('express');
const router = express.Router();
const { 
  getTemplates, 
  getHistory, 
  submitInterview, 
  getAptitude, 
  getAptitudeHistory, 
  submitAptitude,
  startSession,
  logWarning,
  logActivity,
  getWarningsList,
  getActivityLogsList
} = require('../controllers/interviewController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/templates', authMiddleware, getTemplates);
router.get('/history', authMiddleware, getHistory);
router.post('/submit', authMiddleware, submitInterview);

router.get('/aptitude', authMiddleware, getAptitude);
router.get('/aptitude/history', authMiddleware, getAptitudeHistory);
router.post('/aptitude/submit', authMiddleware, submitAptitude);

// Proctoring Logs & Sessions
router.post('/session-start', authMiddleware, startSession);
router.post('/log-warning', authMiddleware, logWarning);
router.post('/log-activity', authMiddleware, logActivity);

// Admin Logs view
router.get('/warnings', authMiddleware, adminMiddleware, getWarningsList);
router.get('/activities', authMiddleware, adminMiddleware, getActivityLogsList);

module.exports = router;
