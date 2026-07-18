const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const geminiRoutes = require('./routes/geminiRoutes');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const sandboxRoutes = require('./routes/sandboxRoutes');
const nexusRoutes = require('./routes/nexusRoutes');


const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend to connect
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/sandbox', sandboxRoutes);
app.use('/api/nexus', nexusRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ElevateAI Backend is running!' });
});

// Root path handler to prevent 404 errors on direct access or ping checks
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ElevateAI Backend API is online!' });
});

// Quiet browser favicon requests to prevent 404 console errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Quiet Chrome DevTools automatic workspace discovery requests
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

// Global async error handler — catches errors thrown in async route handlers/middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});


const axios = require('axios');

// Start Server (Multi-key validation)
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Verify Gemini API Key(s) and list available models
  const apiKeySetting = process.env.GEMINI_API_KEY;
  if (apiKeySetting) {
    const keysToValidate = apiKeySetting.split(',').map(k => k.trim()).filter(k => k.length >= 15);
    for (let i = 0; i < keysToValidate.length; i++) {
      const apiKey = keysToValidate[i];
      const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5);
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models`;
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          }
        });
        const models = response.data.models || [];
        const msg = `[${new Date().toISOString()}] GEMINI API KEY VALIDATION SUCCESS (Key index ${i}, ${maskedKey})! Available models: ${models.map(m => m.name.replace('models/', '')).join(', ')}\n`;
        console.log(`--- GEMINI API KEY VALIDATION (Key index ${i}, ${maskedKey}) ---`);
        console.log(`Success! API Key is working.`);
        console.log('Available models:', models.map(m => m.name.replace('models/', '')).join(', ').substring(0, 120) + '...');
        console.log('-------------------------------------------------');
        const fs = require('fs');
        const path = require('path');
        fs.appendFileSync(path.join(__dirname, 'error.log'), msg, 'utf8');
      } catch (err) {
        let errMsg = `[${new Date().toISOString()}] GEMINI API KEY VALIDATION FAILED (Key index ${i}, ${maskedKey}). Status: ${err.response?.status || 'none'}. Error: ${JSON.stringify(err.response?.data?.error || err.response?.data || err.message)}\n`;
        console.error(`--- GEMINI API KEY ERROR (Key index ${i}, ${maskedKey}) ---`);
        console.error('Failed to validate Gemini API Key.');
        if (err.response) {
          console.error(`Status: ${err.response.status}`);
          console.error(`Error Details:`, JSON.stringify(err.response.data.error || err.response.data));
        } else {
          console.error(`Error Message: ${err.message}`);
        }
        console.error('--------------------------------------------');
        const fs = require('fs');
        const path = require('path');
        fs.appendFileSync(path.join(__dirname, 'error.log'), errMsg, 'utf8');
      }
    }
  } else {
    console.warn('Warning: GEMINI_API_KEY is not defined in the backend environment.');
  }
// Trigger reload: Swapped loops & custom key fallback updated.
});
