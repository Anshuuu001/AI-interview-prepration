import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { MessageSquare, Send, User, RefreshCw, Sparkles, AlertCircle, Mic, MicOff, Volume2, VolumeX, Key, ThumbsUp, ThumbsDown } from 'lucide-react';
import { CAREER_SYSTEM_PROMPT } from '../../services/geminiService';
import { getTranslation } from '../../utils/translations';
import interviewService from '../../services/interviewService';

const AIChatBot = () => {
  const activeLang = localStorage.getItem('language') || 'english';

  const getInitialMessage = () => {
    if (activeLang === 'hindi') {
      return `नमस्ते! मैं आपका ElevateAI करियर असिस्टेंट हूँ। मैं आपकी ड्रीम जॉब पाने में मदद करने के लिए यहाँ हूँ।

आप मुझसे इन चीज़ों के लिए कह सकते हैं:
- एक रिक्रूटर को कोल्ड ईमेल ड्राफ्ट करना।
- अपने रिज्यूम फॉर्मेट की समीक्षा करना और STAR बुलेट पॉइंट्स बनाना।
- सैलरी नेगोशिएशन (वेतन बातचीत) पर टिप्स प्राप्त करना।
- किसी जटिल तकनीकी अवधारणा (जैसे React Hooks या Node.js Event Loop) को समझना।
- एक व्यावहारिक व्यवहार संबंधी (behavioral) इंटरव्यू प्रश्न पूछना।

आज मैं आपकी करियर यात्रा में किस प्रकार सहायता कर सकता हूँ?`;
    } else if (activeLang === 'marathi') {
      return `नमस्कार! मी तुमचा ElevateAI करिअर असिस्टंट आहे. तुमची स्वप्नातील नोकरी मिळवण्यात मदत करण्यासाठी मी येथे आहे.

तुम्ही मला या गोष्टींसाठी विचारू शकता:
- रिक्रूटरला कोल्ड ईमेल मसुदा (draft) तयार करणे.
- तुमच्या बायोडाटा (resume) फॉरमॅटचे पुनरावलोकन करणे आणि STAR बुलेट पॉइंट्स (bullet points) मिळवणे.
- पगार वाटाघाटी (salary negotiation) बाबत टिप्स मिळवणे.
- एखादी गुंतागुंतीची तांत्रिक संकल्पना (जसे की React Hooks किंवा Node.js Event Loop) स्पष्ट करणे.
- सरावासाठी एक व्यावहारिक (behavioral) इंटरव्यू प्रश्न विचारणे.

आज मी तुमच्या करिअरच्या प्रवासात कशी मदत करू शकेन?`;
    }
    return `Hello! I am your ElevateAI Career Assistant. I am here to help you land your dream job.

You can ask me to:
- Draft a cold email to a recruiter.
- Review your resume format and provide STAR bullet points.
- Give you tips on salary negotiation.
- Explain a complex technical concept (like React Hooks or Node.js Event Loop).
- Ask you a practice behavioral interview question.

How can I support your career journey today?`;
  };

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: getInitialMessage(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_gemini_api_key') || '');
  const [hasCustomKey, setHasCustomKey] = useState(!!localStorage.getItem('custom_gemini_api_key'));

  const handleSaveKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('custom_gemini_api_key', customKey.trim());
      setHasCustomKey(true);
    } else {
      localStorage.removeItem('custom_gemini_api_key');
      setHasCustomKey(false);
    }
    setShowKeyModal(false);
  };

  const handleClearKey = () => {
    localStorage.removeItem('custom_gemini_api_key');
    setCustomKey('');
    setHasCustomKey(false);
    setShowKeyModal(false);
  };
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const getQuickPrompts = () => {
    if (activeLang === 'hindi') {
      return [
        "रिएक्ट इंटर्नशिप के लिए कोल्ड ईमेल लिखें",
        "OOP बनाम कार्यात्मक प्रोग्रामिंग समझाएं",
        "STAR कहानियां कैसे तैयार करें?",
        "मुझे 5 HTML इंटरव्यू प्रश्न दें",
        "सॉफ्टवेयर इंजीनियर के लिए रिज्यूम समीक्षा करें",
        "सैलरी ऑफर पर बातचीत कैसे करें?"
      ];
    } else if (activeLang === 'marathi') {
      return [
        "रिएक्ट इंटर्नशिपसाठी कोल्ड ईमेल लिहा",
        "OOP विरुद्ध फंक्शनल प्रोग्रामिंग स्पष्ट करा",
        "STAR कथा कशा तयार करायच्या?",
        "मला 5 HTML इंटरव्यू प्रश्न द्या",
        "सॉफ्टवेअर इंजिनिअरसाठीचे बायोडाटा तपासा",
        "पगार ऑफरवर चर्चा कशी करावी?"
      ];
    }
    return [
      "Write a cold email for a React internship",
      "Explain OOP vs Functional programming",
      "How should I structure STAR stories?",
      "Give me 5 HTML interview questions",
      "Review my resume for a software engineer role",
      "How do I negotiate my salary offer?"
    ];
  };

  const quickPrompts = getQuickPrompts();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      if (activeLang === 'hindi') rec.lang = 'hi-IN';
      else if (activeLang === 'marathi') rec.lang = 'mr-IN';
      else rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please try Google Chrome or MS Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakMessage = (msgId, text) => {
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (activeLang === 'hindi') utterance.lang = 'hi-IN';
    else if (activeLang === 'marathi') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);
    setError(null);

    const startTime = Date.now();

    try {
      const history = updatedMessages
        .filter(m => m.id !== 'msg-init')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : m.sender || 'model',
          text: m.text
        }));

      const resData = await interviewService.chatNexus(history, CAREER_SYSTEM_PROMPT);
      const latencySeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      
      const aiText = resData.text || '';
      const model = resData.sourceModel || 'Gemini Fallback';

      // Detect topic based on message content to classify logs
      let topic = 'General Technical';
      const lower = textToSend.toLowerCase();
      if (lower.includes('react') || lower.includes('html') || lower.includes('css') || lower.includes('frontend')) topic = 'Frontend';
      else if (lower.includes('node') || lower.includes('express') || lower.includes('database') || lower.includes('backend') || lower.includes('sql')) topic = 'Backend';
      else if (lower.includes('thread') || lower.includes('java') || lower.includes('concurrency')) topic = 'Java';
      else if (lower.includes('star') || lower.includes('conflict') || lower.includes('behavioral')) topic = 'Behavioral';

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: latencySeconds,
        questionContext: textToSend.trim(),
        topic,
        sourceModel: model,
        rated: null
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Nexus AI error:', err);
      setError(err.message || 'Failed to get AI response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleRateResponse = async (msg, rating) => {
    try {
      const topic = msg.topic || 'General Technical';
      const timeTaken = msg.latency || 8;
      const question = msg.questionContext || 'General query';
      
      await interviewService.logNexusInteraction({
        question,
        rating,
        timeTaken,
        difficulty: 'Medium',
        topic,
        outcome: rating === 'helpful' ? 'Correct' : 'Incorrect'
      });
      
      setMessages(prev => prev.map(m => {
        if (m.id === msg.id) {
          return { ...m, rated: rating };
        }
        return m;
      }));
    } catch (e) {
      console.error('Failed to log rating:', e);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'ai',
        text: getInitialMessage(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
  };

  // Helper to render **bold** text cleanly without a heavy markdown parser
  const renderItalics = (text) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={idx} className="italic opacity-90 text-indigo-700 dark:text-indigo-200">{part.slice(1, -1)}</em>;
      }
      let cleanPart = part;
      cleanPart = cleanPart.replace(/(?:^|\n)\s*[-*]\s+/g, (match) => {
        return match.startsWith('\n') ? '\n• ' : '• ';
      });
      return cleanPart;
    });
  };

  const renderMessageText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={index} className="font-bold text-indigo-800 dark:text-indigo-300 drop-shadow-sm">
            {renderItalics(part.slice(2, -2))}
          </strong>
        );
      }
      return <React.Fragment key={index}>{renderItalics(part)}</React.Fragment>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up flex flex-col gap-6" style={{ height: 'calc(100vh - 7rem)' }}>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-primary-400" />
            {getTranslation('careerAssistant')}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Gemini AI
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {getTranslation('careerAssistantSubtitle')}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              hasCustomKey
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            {hasCustomKey ? 'API Key Active' : 'Configure API Key'}
          </button>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={handleResetChat}>
            {getTranslation('resetChat')}
          </Button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 dark:text-rose-400 text-xs font-medium flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">{getTranslation('aiError')}</span>
            {error}
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-300 font-bold">✕</button>
        </div>
      )}

      {/* ── Main Chat Body ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Left: Quick Topics */}
        <div className="hidden lg:flex flex-col col-span-1">
          <div className="liquid-glass-card p-5 rounded-2xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-100 mb-1">{getTranslation('quickTopics')}</h3>
            <p className="text-xs text-slate-400 mb-4">{getTranslation('clickPromptToSend')}</p>
            <div className="flex flex-col gap-3">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  disabled={isTyping}
                  className="material-interactive w-full text-left px-4 py-3.5 rounded-xl bg-white/60 dark:bg-[#0a0f18]/60 border border-slate-200 dark:border-white/10 hover:border-cognitive-primary/50 text-xs text-gray-800 dark:text-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cognitive-primary/0 via-cognitive-primary/5 to-cognitive-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 group-hover:text-white transition-colors">{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat Frame */}
        <div className="lg:col-span-3 flex flex-col min-h-0 rounded-2xl overflow-hidden liquid-glass-card shadow-2xl relative">
          
          {/* Subtle Ambient Glow inside chat */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cognitive-primary/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${isAi ? 'mr-auto max-w-[85%]' : 'ml-auto max-w-[85%] flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs text-white shadow-lg ${
                    isAi
                      ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-indigo-500/25 border border-white/10'
                      : 'bg-gradient-to-br from-slate-600 to-slate-800 border border-white/5'
                  }`}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-1.5 min-w-0">
                    <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md border ${
                      isAi
                        ? 'bg-white/90 dark:bg-[#0f172a]/80 backdrop-blur-md border-indigo-500/20 text-gray-900 dark:text-white rounded-tl-sm'
                        : 'bg-gradient-to-br from-indigo-600 to-indigo-800 border-indigo-500/30 text-white rounded-tr-sm shadow-indigo-500/20'
                    }`}>
                      {renderMessageText(msg.text)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-[10px] text-gray-500 dark:text-gray-400 ${isAi ? 'text-left pl-1' : 'text-right pr-1'}`}>
                        {msg.time}
                      </p>
                      {isAi && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={() => speakMessage(msg.id, msg.text)}
                            className={`p-1 rounded-md transition-colors ${
                              speakingMessageId === msg.id
                                ? 'text-rose-500 bg-rose-500/10'
                                : 'text-slate-500 hover:text-primary-400 hover:bg-slate-900/10 dark:hover:bg-white/5'
                            }`}
                            title={speakingMessageId === msg.id ? getTranslation('stop') : getTranslation('listen')}
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleRateResponse(msg, 'helpful')}
                            disabled={!!msg.rated}
                            className={`p-1 rounded-md transition-colors ${
                              msg.rated === 'helpful'
                                ? 'text-emerald-500 bg-emerald-500/10'
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-900/10 dark:hover:bg-white/5'
                            }`}
                            title="Helpful (Logs telemetry)"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRateResponse(msg, 'unhelpful')}
                            disabled={!!msg.rated}
                            className={`p-1 rounded-md transition-colors ${
                              msg.rated === 'unhelpful'
                                ? 'text-rose-500 bg-rose-500/10'
                                : 'text-slate-500 hover:text-rose-500 hover:bg-slate-900/10 dark:hover:bg-white/5'
                            }`}
                            title="Unhelpful (Logs telemetry)"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>

                          {msg.sourceModel && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 select-none ml-2">
                              {msg.sourceModel} {msg.latency && `(${msg.latency}s)`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 mr-auto max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-white/95 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/60 px-4 py-3.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                  <span className="text-[10px] text-slate-400 mr-1 font-medium">{getTranslation('typingIndicator')}</span>
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar — pinned to bottom */}
          <div className="flex-shrink-0 p-5 border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0f18]/80 backdrop-blur-xl relative z-20">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
              className="flex gap-3 relative"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 dark:text-rose-400 animate-pulse'
                    : 'bg-slate-50/90 dark:bg-white/5 border-slate-300 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
                title={isListening ? getTranslation('stop') : getTranslation('startListening')}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getTranslation('inputPlaceholder')}
                disabled={isTyping}
                className="flex-1 px-5 py-3 bg-white dark:bg-[#0d131f] border border-slate-200 dark:border-white/10 focus:border-cognitive-primary/50 focus:ring-1 focus:ring-cognitive-primary/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm transition-all focus:outline-none disabled:opacity-60 shadow-inner"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                icon={Send}
                className="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 border-none shadow-lg shadow-cyan-500/25 text-white"
              >
                {getTranslation('send')}
              </Button>
            </form>
          </div>
        </div>

      </div>

      {/* ── API Key Configuration Modal ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden bg-[#0d131f]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Configure Gemini API Key
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If the server's free-tier Gemini API key has exceeded its daily/minute quota, you can configure your own personal API key. This key will be saved locally on your device and sent to the server for model authorization.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 focus:border-indigo-500 rounded-xl text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                />
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>You can get a free API Key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setCustomKey(localStorage.getItem('custom_gemini_api_key') || '');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 text-slate-400 transition-colors"
              >
                Cancel
              </button>
              {localStorage.getItem('custom_gemini_api_key') && (
                <button
                  onClick={handleClearKey}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-colors"
                >
                  Clear Key
                </button>
              )}
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
