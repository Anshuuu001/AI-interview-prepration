const axios = require('axios');
const fs = require('fs');
const path = require('path');

const MODELS_TO_TRY = [
  { version: 'v1beta', model: 'gemini-2.0-flash' },
  { version: 'v1beta', model: 'gemini-1.5-flash' },
  { version: 'v1beta', model: 'gemini-1.5-pro' },
  { version: 'v1beta', model: 'gemini-flash-latest' },
  { version: 'v1beta', model: 'gemini-3.5-flash' },
  { version: 'v1beta', model: 'gemini-2.5-flash' },
  { version: 'v1beta', model: 'gemini-2.5-pro' }
];

const callGeminiApi = async ({ history, systemInstruction, customKey }) => {
  // Parse environment API keys (comma-separated list for rotation)
  const envKeys = process.env.GEMINI_API_KEY 
    ? process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(k => k.length >= 15)
    : [];

  let apiKeys = [];
  if (customKey && customKey.trim().length >= 15) {
    apiKeys.push(customKey.trim());
  }
  
  // Add server environment keys as fallbacks
  envKeys.forEach(k => {
    if (!apiKeys.includes(k)) {
      apiKeys.push(k);
    }
  });

  if (apiKeys.length === 0) {
    throw new Error('Valid Gemini API Key is missing on the server.');
  }

  // Format history for Gemini API
  const historyArray = Array.isArray(history) ? history : [];
  const contents = historyArray.map((msg) => {
    const role = msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user';
    const text = msg.text || (msg.parts && msg.parts[0]?.text) || '';
    return {
      role,
      parts: [{ text }]
    };
  });

  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: 'Hello' }]
    });
  }

  let lastError = null;
  const invalidKeys = new Set();

  // Try the best models first, rotating across keys, then falling back to secondary models
  for (const config of MODELS_TO_TRY) {
    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
      if (invalidKeys.has(keyIndex)) continue;

      const apiKey = apiKeys[keyIndex];

      try {
        const isGeminiPro = config.model.includes('pro');
        
        // Deep clone contents so we can modify it per-model without affecting the next iteration
        const currentContents = JSON.parse(JSON.stringify(contents));
        
        const currentBody = {
          contents: currentContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        };

        if (systemInstruction) {
          if (!isGeminiPro && config.version === 'v1beta') {
            currentBody.system_instruction = { parts: [{ text: systemInstruction }] };
          } else {
            // Prepend system instruction to the first user message as a fallback
            if (currentBody.contents.length > 0 && currentBody.contents[0].role === 'user') {
              currentBody.contents[0].parts[0].text = `[System Instruction: ${systemInstruction}]\n\n${currentBody.contents[0].parts[0].text}`;
            } else {
               currentBody.contents.unshift({ role: 'user', parts: [{ text: `[System Instruction: ${systemInstruction}]` }] });
            }
          }
        }

        const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent`;
        const response = await axios.post(url, currentBody, {
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          }
        });

        const data = response.data;
        if (data.candidates && data.candidates.length > 0) {
          const text = data.candidates[0].content.parts[0].text;
          if (text) return text.trim();
        }
        throw new Error('No candidates returned from Gemini API.');
      } catch (err) {
        lastError = err;
        const errResponse = err.response?.data?.error;
        
        console.warn(`Gemini API call failed for key index ${keyIndex}, model ${config.model} (${config.version}): ${errResponse?.message || err.message}`);
        
        // If API key invalid, mark it and try next key immediately
        if (errResponse?.message?.toLowerCase().includes('api key not valid') || 
            (errResponse?.status === 'INVALID_ARGUMENT' && errResponse?.message?.toLowerCase().includes('key'))) {
          console.error(`Fatal API Key Error for key index ${keyIndex}. Marking key as invalid.`);
          invalidKeys.add(keyIndex);
          continue;
        }

        // If quota exceeded or 429, try next key for this model
        if (err.response?.status === 429 || 
            errResponse?.status === 'RESOURCE_EXHAUSTED' || 
            errResponse?.message?.toLowerCase().includes('quota')) {
          console.error(`Quota Exceeded (429 / RESOURCE_EXHAUSTED) for key index ${keyIndex}, model ${config.model}. Trying next key if available.`);
          continue;
        }
        
        // Otherwise, continue to next key
        continue;
      }
    }
  }

  // If we reach here, all keys and models failed. Log to file and throw.
  try {
    const logPath = path.join(__dirname, '../error.log');
    const logMsg = `[${new Date().toISOString()}] ALL KEYS/MODELS FAILED. Last Error: ${lastError?.message || 'unknown'}\n` +
      `Response Status: ${lastError?.response?.status || 'none'}\n` +
      `Response Data: ${JSON.stringify(lastError?.response?.data || {})}\n\n`;
    fs.appendFileSync(logPath, logMsg, 'utf8');
  } catch (logErr) {
    console.error('Failed to write to error log file:', logErr.message);
  }

  throw lastError || new Error('All Gemini API endpoints and keys failed.');
};

module.exports = {
  callGeminiApi,
  MODELS_TO_TRY
};
