const axios = require('axios');

let runtimesCache = null;

const getRuntimes = async () => {
  if (runtimesCache) return runtimesCache;
  try {
    const response = await axios.get('https://emkc.org/api/v2/piston/runtimes');
    runtimesCache = response.data;
    return runtimesCache;
  } catch (err) {
    console.error('Failed to fetch Piston runtimes:', err.message);
    // Fallback runtimes in case the API is down or rate-limited
    return [
      { language: 'javascript', version: '18.15.0', aliases: ['js', 'node'] },
      { language: 'python', version: '3.10.0', aliases: ['py', 'python3'] },
      { language: 'java', version: '15.0.2', aliases: [] },
      { language: 'c++', version: '10.2.0', aliases: ['cpp', 'cplusplus'] },
      { language: 'go', version: '1.16.2', aliases: [] }
    ];
  }
};

const runCode = async (req, res) => {
  const { code, language } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  if (!language) {
    return res.status(400).json({ error: 'Language is required' });
  }

  const runtimes = await getRuntimes();
  const normalizedLang = language.toLowerCase();
  
  // Try to find the matching runtime by language name or alias
  const runtime = runtimes.find(r => 
    r.language.toLowerCase() === normalizedLang || 
    (r.aliases && r.aliases.map(a => a.toLowerCase()).includes(normalizedLang))
  );

  if (!runtime) {
    return res.status(400).json({ error: `Language "${language}" is not supported by the execution sandbox.` });
  }

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: runtime.language,
      version: runtime.version,
      files: [
        {
          content: code
        }
      ]
    });

    const result = response.data;
    if (result && result.run) {
      return res.status(200).json({
        stdout: result.run.stdout || '',
        stderr: result.run.stderr || '',
        output: result.run.output || '',
        code: result.run.code,
        signal: result.run.signal
      });
    } else {
      throw new Error('Unexpected response format from execution engine');
    }
  } catch (err) {
    console.error('Piston execution failed:', err.response?.data || err.message);
    return res.status(500).json({ 
      error: 'Failed to run code in compilation sandbox. Please try again.',
      details: err.response?.data || err.message 
    });
  }
};

module.exports = {
  runCode
};
