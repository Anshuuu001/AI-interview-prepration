const express = require('express');
const router = express.Router();
const { askGemini } = require('../controllers/geminiController');

// Route to handle AI requests
router.post('/ask', askGemini);

module.exports = router;
