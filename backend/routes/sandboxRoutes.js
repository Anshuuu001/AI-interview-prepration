const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/sandboxController');

// Route to execute user code in isolated sandbox
router.post('/run', runCode);

module.exports = router;
