const express = require('express');
const router = express.Router();
const {
  getMemory,
  updateMemory,
  logInteraction,
  getGlobalAnalytics,
  chatNexus,
  getConfig,
  updateConfig,
  simulateFinetuning
} = require('../controllers/nexusController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// User scopes
router.get('/memory', authMiddleware, getMemory);
router.post('/memory', authMiddleware, updateMemory);
router.post('/log-interaction', authMiddleware, logInteraction);
router.post('/chat', authMiddleware, chatNexus);

// Admin scopes
router.get('/config', authMiddleware, getConfig);
router.post('/config', authMiddleware, updateConfig);
router.get('/global-analytics', authMiddleware, adminMiddleware, getGlobalAnalytics);
router.post('/fine-tune/simulate', authMiddleware, adminMiddleware, simulateFinetuning);

module.exports = router;
