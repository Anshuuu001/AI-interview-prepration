const { readData, writeData } = require('../utils/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { callGeminiApi } = require('../utils/geminiHelper');

const CONFIG_FILE = 'nexus_config.json';
const MEMORY_FILE = 'personal_memories.json';
const LOGS_FILE = 'learning_logs.json';
const VECTOR_FILE = 'vector_db.json';

// Default system configurations
const defaultConfig = {
  activeModel: 'qwen3-8b',
  activeVersion: 'Nexus AI v1.0',
  ollamaUrl: 'http://localhost:11434',
  isFinetuning: false,
  finetuneProgress: 0,
  finetuneLogs: []
};

// Check if local Ollama service is online
async function checkOllamaStatus(url) {
  try {
    const res = await axios.get(url, { timeout: 1000 });
    return res.status === 200 ? 'ONLINE' : 'OFFLINE';
  } catch (e) {
    return 'OFFLINE';
  }
}

// Helper to compute word frequency bag-of-words representation for offline similarity matching
function getBagOfWords(text) {
  if (!text) return {};
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  const freq = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });
  return freq;
}

// Calculate Cosine Similarity between two bag-of-words frequencies
function calculateCosineSimilarity(freqA, freqB) {
  const keys = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  keys.forEach(key => {
    const valA = freqA[key] || 0;
    const valB = freqB[key] || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  });

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Get or create personal memory for a user
const getMemory = (req, res) => {
  const userId = req.user.id;
  const memories = readData(MEMORY_FILE, {});
  
  // If memory already exists, load and return
  if (memories[userId]) {
    return res.json(memories[userId]);
  }

  // Otherwise, compile profile details and past reports to initialize memory
  const users = readData('users.json', []);
  const user = users.find(u => u.id === userId) || {};
  const interviews = readData('interviews.json', []);
  const userInterviews = interviews.filter(i => i.userId === userId);

  // Extract weak topics (where user scored under 65% in mock interviews)
  const weakTopics = new Set();
  const strongTopics = new Set();
  
  userInterviews.forEach(interview => {
    const overall = interview.overallScore;
    if (overall >= 80) {
      strongTopics.add(interview.roleTitle || 'General Software Engineering');
    } else if (overall < 65) {
      weakTopics.add(interview.roleTitle || 'General Software Engineering');
    }
  });

  const newMemory = {
    userId,
    resume: user.bio || '',
    skills: user.skills || [],
    careerGoal: user.title || 'Graduate Candidate',
    interviewHistory: userInterviews.map(i => ({ id: i.id, role: i.roleTitle, score: i.overallScore, date: i.date })),
    weakTopics: Array.from(weakTopics),
    strongTopics: Array.from(strongTopics),
    preferredLanguage: 'English',
    learningStyle: 'Practical & Example-Driven',
    notes: '',
    uploadedPdfs: []
  };

  memories[userId] = newMemory;
  writeData(MEMORY_FILE, memories);
  res.json(newMemory);
};

// Update memory
const updateMemory = (req, res) => {
  const userId = req.user.id;
  const memories = readData(MEMORY_FILE, {});
  const current = memories[userId] || {};

  memories[userId] = {
    ...current,
    ...req.body,
    userId
  };

  writeData(MEMORY_FILE, memories);
  res.json(memories[userId]);
};

// Log user chat interaction metrics (Learning Engine)
const logInteraction = (req, res) => {
  const userId = req.user.id;
  const { question, rating, timeTaken, difficulty, topic, outcome } = req.body;
  const logs = readData(LOGS_FILE, []);

  const newLog = {
    id: `log-${Date.now()}`,
    userId,
    question,
    rating: rating || 'helpful',
    timeTaken: timeTaken || 10,
    difficulty: difficulty || 'Medium',
    topic: topic || 'General Technical',
    outcome: outcome || 'Correct',
    timestamp: Date.now()
  };

  logs.push(newLog);
  writeData(LOGS_FILE, logs);

  // Auto-tune personal memory strong/weak topics based on outcomes
  const memories = readData(MEMORY_FILE, {});
  if (memories[userId]) {
    const memory = memories[userId];
    if (outcome === 'Incorrect' && !memory.weakTopics.includes(topic)) {
      memory.weakTopics.push(topic);
    } else if (outcome === 'Correct' && !memory.strongTopics.includes(topic)) {
      memory.strongTopics.push(topic);
      // Remove from weak if they are now correct
      memory.weakTopics = memory.weakTopics.filter(t => t !== topic);
    }
    memories[userId] = memory;
    writeData(MEMORY_FILE, memories);
  }

  res.json({ success: true, log: newLog });
};

// Get global aggregated anonymous analytics (Layer 5)
const getGlobalAnalytics = (req, res) => {
  const logs = readData(LOGS_FILE, []);
  
  // Calculate frequencies
  const topicCounts = {};
  const helpfulnessCount = { helpful: 0, unhelpful: 0 };
  const avgLatency = logs.length > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + curr.timeTaken, 0) / logs.length)
    : 8;

  logs.forEach(log => {
    topicCounts[log.topic] = (topicCounts[log.topic] || 0) + 1;
    if (log.rating === 'helpful') helpfulnessCount.helpful++;
    if (log.rating === 'unhelpful') helpfulnessCount.unhelpful++;
  });

  // Get most common topics
  const topTopics = Object.entries(topicCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    totalInteractions: logs.length,
    avgLatencySeconds: avgLatency,
    helpfulnessRatio: helpfulnessCount,
    topWeakTopics: topTopics,
    frequentQuestions: [
      { topic: "Java Threads", count: 42, usefulness: "94%" },
      { topic: "System Design Scalability", count: 35, usefulness: "88%" },
      { topic: "Database Joins & Indexing", count: 28, usefulness: "91%" },
      { topic: "React Hooks & Context", count: 22, usefulness: "85%" }
    ]
  });
};

// RAG Search & Chat completions endpoint (Layer 3)
const chatNexus = async (req, res) => {
  const userId = req.user.id;
  const { messages, systemInstruction } = req.body;
  const customKey = req.headers['x-gemini-key'];
  const currentMsg = messages[messages.length - 1]?.text || '';
  
  // 1. Gather all document materials to build local vector indexes
  const memories = readData(MEMORY_FILE, {});
  const userMemory = memories[userId] || {};
  const resumes = readData('resumes.json', []);
  const userResume = resumes.find(r => r.userId === userId) || {};
  const interviews = readData('interviews.json', []);
  const userInterviews = interviews.filter(i => i.userId === userId);

  const chunks = [];
  
  // Extract chunks from Resume
  if (userResume.skills) chunks.push({ text: `Resume Skills: ${userResume.skills.join(', ')}`, source: 'Resume' });
  if (userResume.education) chunks.push({ text: `Resume Education: ${JSON.stringify(userResume.education)}`, source: 'Resume' });
  if (userResume.experience) {
    userResume.experience.forEach(exp => {
      chunks.push({ text: `Resume Professional Experience at ${exp.company} as ${exp.role} (${exp.duration}): ${exp.description}`, source: 'Resume' });
    });
  }

  // Extract chunks from past interview feedback
  userInterviews.forEach((report, idx) => {
    chunks.push({
      text: `Past Interview #${idx + 1} (${report.roleTitle}) Overall score was ${report.overallScore}%. Feedback remarks: ${report.feedback}`,
      source: 'Interview Report'
    });
  });

  // Extract chunks from user memory bio/goals
  if (userMemory.careerGoal) chunks.push({ text: `User Career Goals: ${userMemory.careerGoal}`, source: 'User Memory' });
  if (userMemory.notes) chunks.push({ text: `User Personal Study Notes: ${userMemory.notes}`, source: 'User Notes' });

  // 2. Perform Cosine Similarity matching over document bags-of-words
  const queryBag = getBagOfWords(currentMsg);
  const scoredChunks = chunks.map(chunk => {
    const chunkBag = getBagOfWords(chunk.text);
    const similarity = calculateCosineSimilarity(queryBag, chunkBag);
    return { ...chunk, similarity };
  });

  // Retrieve top 3 most relevant matches
  const topMatches = scoredChunks
    .filter(c => c.similarity > 0.05)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  // 3. Construct contextual system instructions for RAG injection
  let contextText = '';
  if (topMatches.length > 0) {
    contextText = "\n[Nexus RAG Context retrieved from User Records]:\n" + 
      topMatches.map((m, i) => `${i + 1}. [Source: ${m.source}] ${m.text}`).join('\n') + "\n\n";
  }

  const finalInstruction = (systemInstruction || '') + contextText + 
    `\nPreferred Language: ${userMemory.preferredLanguage || 'English'}.\n` +
    `Learning Style: ${userMemory.learningStyle || 'Example-Driven'}.`;

  const config = readData(CONFIG_FILE, defaultConfig);
  const ollamaOnline = await checkOllamaStatus(config.ollamaUrl);

  // Format messages list for Ollama / Gemini API
  const history = messages.map(m => ({
    role: m.role === 'ai' || m.role === 'model' ? 'model' : m.role || 'user',
    text: m.text
  }));

  // 4. Dispatch chat request to either local Ollama base or Gemini API fallback
  if (ollamaOnline === 'ONLINE') {
    try {
      const ollamaModelName = config.activeModel === 'deepseek-coder-v2' 
        ? 'deepseek-coder:6.7b' 
        : 'qwen2.5:7b'; // maps standard models on local systems

      const ollamaMessages = history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
      }));

      // Prepend system instruction to first message
      if (ollamaMessages.length > 0) {
        ollamaMessages[0].content = `[System Instruction: ${finalInstruction}]\n\n${ollamaMessages[0].content}`;
      }

      const response = await axios.post(`${config.ollamaUrl}/api/chat`, {
        model: ollamaModelName,
        messages: ollamaMessages,
        stream: false
      }, { timeout: 15000 });

      const reply = response.data?.message?.content || '';
      if (reply) {
        return res.json({ text: reply, ragMatches: topMatches, sourceModel: config.activeModel });
      }
    } catch (ollamaErr) {
      console.warn("Ollama query failed, falling back to Gemini:", ollamaErr.message);
    }
  }

  // Fallback to Gemini if Ollama is offline or fails
  try {
    const text = await callGeminiApi({ history, systemInstruction: finalInstruction, customKey });
    return res.json({ text, ragMatches: topMatches, sourceModel: 'Gemini (Ollama Offline Fallback)' });
  } catch (geminiErr) {
    console.error("Gemini fallback also failed in chatNexus:", geminiErr.message);
    // Simple text response simulator fallback
    return res.json({
      text: `Based on your request, I processed your query locally. (Note: Ollama and Gemini APIs are currently offline. Local Cosine similarity matching fetched: ${topMatches.map(m => m.source).join(', ') || 'No relevant chunks found.'})`,
      ragMatches: topMatches,
      sourceModel: 'Fallback Simulator'
    });
  }
};

// Get core configuration
const getConfig = async (req, res) => {
  const config = readData(CONFIG_FILE, defaultConfig);
  const status = await checkOllamaStatus(config.ollamaUrl);
  res.json({
    ...config,
    ollamaStatus: status
  });
};

// Update active base model or configuration
const updateConfig = (req, res) => {
  const current = readData(CONFIG_FILE, defaultConfig);
  const updated = {
    ...current,
    ...req.body
  };
  writeData(CONFIG_FILE, updated);
  res.json(updated);
};

// Simulate fine-tuning progress logging (Layer 7)
const simulateFinetuning = (req, res) => {
  const current = readData(CONFIG_FILE, defaultConfig);
  if (current.isFinetuning) {
    return res.status(400).json({ error: 'Fine-tuning is already active.' });
  }

  // Put in progress
  const logs = [
    `[${new Date().toLocaleTimeString()}] Initializing training pipeline...`,
    `[${new Date().toLocaleTimeString()}] Fetching anonymous interaction logs from learning_logs.json...`,
    `[${new Date().toLocaleTimeString()}] Cleaned and compiled dataset (Found ${readData(LOGS_FILE, []).length} interactions).`,
    `[${new Date().toLocaleTimeString()}] Initializing LoRA adapters for ${current.activeModel === 'deepseek-coder-v2' ? 'DeepSeek-Coder' : 'Qwen3'} (rank=8, alpha=16).`
  ];

  const updatedConfig = {
    ...current,
    isFinetuning: true,
    finetuneProgress: 10,
    finetuneLogs: logs
  };
  writeData(CONFIG_FILE, updatedConfig);

  // Background simulation runner
  let progress = 10;
  const interval = setInterval(() => {
    const cfg = readData(CONFIG_FILE, defaultConfig);
    if (!cfg.isFinetuning) {
      clearInterval(interval);
      return;
    }

    progress += 30;
    const currentLogs = [...cfg.finetuneLogs];

    if (progress === 40) {
      currentLogs.push(`[${new Date().toLocaleTimeString()}] Training Epoch 1/3 completed. Training Loss = 1.42, Validation Loss = 1.55`);
    } else if (progress === 70) {
      currentLogs.push(`[${new Date().toLocaleTimeString()}] Training Epoch 2/3 completed. Training Loss = 0.88, Validation Loss = 1.05`);
    } else if (progress >= 100) {
      progress = 100;
      currentLogs.push(`[${new Date().toLocaleTimeString()}] Training Epoch 3/3 completed. Training Loss = 0.42, Validation Loss = 0.76`);
      currentLogs.push(`[${new Date().toLocaleTimeString()}] Fine-tuning completed successfully! Saving LoRA weights...`);
      
      // Increment active model version
      const oldVer = cfg.activeVersion || 'Nexus AI v1.0';
      const parts = oldVer.split('v');
      const majorMinor = parseFloat(parts[1] || '1.0');
      const nextVer = `Nexus AI v${(majorMinor + 0.1).toFixed(1)}`;
      currentLogs.push(`[${new Date().toLocaleTimeString()}] Adapter weights saved. Upgraded system version: ${oldVer} -> ${nextVer}`);
      
      const finishedConfig = {
        ...cfg,
        isFinetuning: false,
        finetuneProgress: 100,
        activeVersion: nextVer,
        finetuneLogs: currentLogs
      };
      writeData(CONFIG_FILE, finishedConfig);
      clearInterval(interval);
      return;
    }

    const updatedCfg = {
      ...cfg,
      finetuneProgress: progress,
      finetuneLogs: currentLogs
    };
    writeData(CONFIG_FILE, updatedCfg);
  }, 3000);

  res.json(updatedConfig);
};

module.exports = {
  getMemory,
  updateMemory,
  logInteraction,
  getGlobalAnalytics,
  chatNexus,
  getConfig,
  updateConfig,
  simulateFinetuning
};
