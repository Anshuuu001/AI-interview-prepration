import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Rocket, Star } from 'lucide-react';
import { callGemini, ANTIGRAVITY_SYSTEM_PROMPT } from '../services/geminiService';

const AntigravityMode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'model', 
          text: "Hey! 🚀 Feeling the gravity of interviews pulling you down? Let's defy it together! 🌌\n\nI'm Antigravity, your personal stress-buster. Need a motivational boost, a quick fun game, or just someone to hype you up?" 
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedHistory = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const responseText = await callGemini(updatedHistory, ANTIGRAVITY_SYSTEM_PROMPT);
      setMessages((prev) => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', text: "Whoops! Even rockets hit turbulence sometimes. 🌪️ Try sending that again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end group">
        <button
          onClick={() => setIsOpen(true)}
          className={`
            relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300
            bg-gradient-to-tr from-indigo-600 to-purple-500 hover:scale-110 hover:shadow-indigo-500/50
            animate-float-slow
            ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
          `}
        >
          {/* Subtle pulse ring behind button */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-50 animate-ping" style={{ animationDuration: '3s' }}></div>
          <Rocket className="w-6 h-6 text-white translate-x-0.5 -translate-y-0.5" />
        </button>

        {/* Tooltip */}
        <div className={`
          absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg
          bg-slate-900/90 text-white text-xs font-semibold backdrop-blur-md border border-slate-700
          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
          ${isOpen ? 'hidden' : 'block'}
        `}>
          Antigravity Mode 🌌<br/>
          <span className="text-slate-400 font-normal">Defy interview anxiety!</span>
        </div>
      </div>

      {/* Glassmorphic Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[110] w-[350px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50 liquid-glass-card animate-fade-in-up origin-bottom-right">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1">
                  Antigravity Mode <Star className="w-3 h-3 text-yellow-300 fill-current" />
                </h3>
                <p className="text-indigo-100 text-[10px] uppercase font-semibold tracking-wider">Zero-G Stress Buster</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Need a boost? Type here..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};

export default AntigravityMode;
