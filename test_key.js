const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key extracted:', apiKey ? (apiKey.substring(0, 10) + '...') : 'none');

const body = {
  contents: [{ role: 'user', parts: [{ text: 'Hello, are you there?' }] }]
};

const configs = [
  { version: 'v1', model: 'gemini-1.5-flash' },
  { version: 'v1beta', model: 'gemini-1.5-flash' }
];

async function run() {
  for (const config of configs) {
    const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
    console.log(`Trying ${config.version} / ${config.model}...`);
    try {
      const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
      console.log(`Success! Response:`, JSON.stringify(res.data.candidates?.[0]?.content?.parts?.[0]?.text));
      return;
    } catch (err) {
      console.log(`Failed for ${config.version} / ${config.model}:`);
      if (err.response) {
        console.log(`Status: ${err.response.status}`);
        console.log(`Data:`, JSON.stringify(err.response.data));
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  }
}

run();
