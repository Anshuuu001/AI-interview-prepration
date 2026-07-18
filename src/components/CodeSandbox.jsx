import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Card from './Card';
import Button from './Button';
import { 
  Play, Code2, RefreshCw, Sparkles, Activity, ShieldCheck, 
  Rocket, Moon, Cpu, PlayCircle, Target, Check, AlertTriangle, 
  Lightbulb, Zap, RotateCcw, ShieldAlert, Award, ChevronLeft, ChevronRight,
  BookOpen
} from 'lucide-react';
import { 
  askGemini, 
  ANTIGRAVITY_CODING_SPACE_PROMPT, 
  DRY_RUN_PROMPT, 
  CODE_EXPLAINER_PROMPT, 
  CLEAN_CODE_PROMPT, 
  ANTIGRAVITY_ERROR_PROMPT,
  PRACTICE_CHALLENGE_PROMPT,
  CODE_EXECUTION_PROMPT,
  MISTAKE_DETECTOR_PROMPT,
  GHOST_TEXT_PROMPT
} from '../services/geminiService';

// Default templates for supported languages
const LANGUAGE_TEMPLATES = {
  javascript: `// JavaScript Coding Arena\nfunction main() {\n    console.log("Hello, Arena!");\n}\nmain();`,
  typescript: `// TypeScript Coding Arena\ninterface User {\n    name: string;\n    role: string;\n    level: number;\n}\n\nfunction greetUser(user: User): string {\n    return \`Welcome, \${user.name} (\${user.role}) to Level \${user.level}!\`;\n}\n\nconst student: User = { name: "Arena Learner", role: "Student", level: 1 };\nconsole.log(greetUser(student));`,
  python: `# Python Coding Arena\ndef main():\n    print("Hello, Arena!")\n\nif __name__ == "__main__":\n    main()`,
  java: `// Java Coding Arena\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Arena!");\n    }\n}`,
  cpp: `// C++ Coding Arena\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, Arena!" << endl;\n    return 0;\n}`,
  go: `// Go Coding Arena\npackage main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Arena!")\n}`,
  rust: `// Rust Coding Arena\nfn main() {\n    println!("Hello, Arena from Rust!");\n}`,
  php: `<?php\n// PHP Coding Practice\necho "Hello, Arena from PHP!\\n";\n$skills = ["Algorithm", "Design", "Security"];\nforeach ($skills as $skill) {\n    echo "- " . $skill . "\\n";\n}\n?>`,
  ruby: `# Ruby Coding Practice\nputs "Hello, Arena from Ruby!"\n5.times do |i|\n    puts "Coding Level: #{i + 1}"\nend`,
  html: `<!-- HTML Coding Practice -->\n<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        body {\n            font-family: sans-serif;\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            height: 80vh;\n            margin: 0;\n            background-color: #0f172a;\n            color: white;\n        }\n        h1 {\n            color: #38bdf8;\n        }\n    </style>\n</head>\n<body>\n    <div style="text-align: center;">\n        <h1>Welcome to the Coding Arena!</h1>\n        <p>This is a live HTML preview rendering inside the compiler console.</p>\n    </div>\n</body>\n</html>`,
  css: `/* CSS Coding Practice */\nbody {\n    background-color: #0f172a;\n    color: #f8fafc;\n    font-family: 'Inter', sans-serif;\n    margin: 0;\n    padding: 2rem;\n}\n\n.card {\n    background: rgba(255, 255, 255, 0.05);\n    backdrop-filter: blur(10px);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 12px;\n    padding: 1.5rem;\n    max-width: 400px;\n}`
};

const CodeSandbox = ({ initialCode = '', language = 'javascript', onChange }) => {
  const [code, setCode] = useState(initialCode || LANGUAGE_TEMPLATES[language] || LANGUAGE_TEMPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  
  // AI Sandbox Features State
  const [antigravityMode, setAntigravityMode] = useState(false);
  const [activePanel, setActivePanel] = useState('console'); // console, antigravity, dryrun, quantum, clean, mistakes
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [challengeData, setChallengeData] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [aiMode, setAiMode] = useState('Teaching');

  // New Upgrade Features State
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [energy, setEnergy] = useState(100); // Energy (Mana) points
  const [historyTimeline, setHistoryTimeline] = useState([]); // Time travel history
  const [timelineIndex, setTimelineIndex] = useState(-1);
  const [localViolation, setLocalViolation] = useState(null); // Local Anti-cheat trigger
  const [violationCount, setViolationCount] = useState(0);
  const [ghostTextEnabled, setGhostTextEnabled] = useState(true);

  // Refs for tracking editor/completions and key speeds
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const completionProviderRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const isSlidingRef = useRef(false);
  const lastKeystrokeTimeRef = useRef(null);
  const fastKeystrokesCountRef = useRef(0);
  const ghostTextEnabledRef = useRef(ghostTextEnabled);

  // Sync ref with state
  useEffect(() => {
    ghostTextEnabledRef.current = ghostTextEnabled;
  }, [ghostTextEnabled]);

  // Periodic Idle Energy Recharge (+5 Mana every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 5));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Set up initial timeline milestone
  useEffect(() => {
    if (code && historyTimeline.length === 0) {
      setHistoryTimeline([{ code, timestamp: new Date() }]);
      setTimelineIndex(0);
    }
  }, [code]);

  // Track code modifications for time-travel timeline (debounced 15 seconds)
  useEffect(() => {
    if (isSlidingRef.current || isInitialLoadRef.current || !code) return;

    const lastEntry = historyTimeline[historyTimeline.length - 1];
    if (lastEntry && lastEntry.code === code) return;

    const timer = setTimeout(() => {
      setHistoryTimeline(prev => {
        const updated = [...prev, { code, timestamp: new Date() }];
        // Limit timeline size to 30 snapshots to avoid memory bloat
        if (updated.length > 30) updated.shift();
        setTimelineIndex(updated.length - 1);
        return updated;
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [code]);

  // Reset loader block after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update editor value when switching language templates
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    const template = LANGUAGE_TEMPLATES[newLang] || '// Write your code';
    
    isInitialLoadRef.current = true;
    setCode(template);
    saveMilestone(template);
    
    if (onChange) onChange(template);
    
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 500);
  };

  // Re-register inline autocomplete helper if selectedLanguage changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      setupGhostTextAutocomplete(monacoRef.current, selectedLanguage);
    }
  }, [selectedLanguage]);

  const saveMilestone = (newCode) => {
    setHistoryTimeline(prev => {
      const filtered = prev.filter(h => h.code !== newCode);
      const updated = [...filtered, { code: newCode, timestamp: new Date() }];
      if (updated.length > 30) updated.shift();
      setTimelineIndex(updated.length - 1);
      return updated;
    });
  };

  const handleReset = () => {
    const defaultTemplate = LANGUAGE_TEMPLATES[selectedLanguage] || initialCode;
    setCode(defaultTemplate);
    setOutput('');
    setActivePanel('console');
    setAiData(null);
    setChallengeData(null);
    saveMilestone(defaultTemplate);
    if (onChange) onChange(defaultTemplate);
  };

  // Safe Isolated Compilation & Execution using backend sandbox (Piston Engine Proxy)
  const handleRunCode = async () => {
    if (energy < 5) {
      triggerViolation("⚡ Insufficient Energy! You need at least 5 Mana points to run code.");
      return;
    }

    setIsCompiling(true);
    setActivePanel('console');
    setOutput('Compiling & Executing in Remote Sandbox... ⚙️');
    setEnergy(prev => Math.max(0, prev - 5));

    try {
      // If HTML language selected, run in frontend preview
      if (selectedLanguage === 'html') {
        setOutput(code);
        setEnergy(prev => Math.min(100, prev + 25)); // Reward points
        setIsCompiling(false);
        saveMilestone(code);
        return;
      }

      // If Antigravity Humor mode is ON, simulate funny AI error handler
      if (antigravityMode) {
        setOutput('SyntaxError: Unexpected token... calling Antigravity AI 🌌');
        const friendlyError = await askGemini(`User's code has an error:\n${code}`, ANTIGRAVITY_ERROR_PROMPT);
        setOutput(`❌ Simulated Error\n\n🌌 ANTIGRAVITY SAYS:\n${friendlyError}`);
        setIsCompiling(false);
        return;
      }

      // Call our Piston execution proxy backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_URL}/sandbox/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: selectedLanguage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Execution request failed');
      }

      const runResult = await response.json();
      
      if (runResult.stderr) {
        setOutput(`❌ Compilation/Runtime Error:\n\n${runResult.stderr}`);
      } else {
        setOutput(runResult.stdout || 'Code completed successfully with no output.');
        // Successful runs reward +25 energy points!
        if (runResult.code === 0) {
          setEnergy(prev => Math.min(100, prev + 25));
        }
      }

      // Save code snapshot
      saveMilestone(code);
    } catch (e) {
      console.warn("Real compilation sandbox error. Falling back to Gemini simulator:", e.message);
      // Fallback to Gemini simulator if backend compiler is unreachable
      try {
        const executionOutput = await askGemini(code, CODE_EXECUTION_PROMPT);
        setOutput(executionOutput);
      } catch (geminiErr) {
        setOutput(`❌ Sandbox Error executing code:\n${geminiErr.message}`);
      }
    } finally {
      setIsCompiling(false);
    }
  };

  // AI Review Mistake Detector (Tutor Mode)
  const handleReviewCode = async () => {
    if (energy < 15) {
      triggerViolation("⚡ Insufficient Energy! You need at least 15 Mana points to review mistakes.");
      return;
    }
    
    setIsCompiling(true);
    setActivePanel('mistakes');
    setOutput('AI Coding Tutor is inspecting your code structure... 🤖');
    setEnergy(prev => Math.max(0, prev - 15));

    try {
      const errorContext = output && output !== 'Ready.' && !output.includes('Executing') ? `Output/Errors:\n${output}` : 'No compiler execution logs available yet.';
      const promptPayload = `Language: ${selectedLanguage}\nUser Code:\n${code}\n\n${errorContext}`;
      const friendlyReview = await askGemini(promptPayload, MISTAKE_DETECTOR_PROMPT);
      
      // Save AI tutor output
      setAiData({ review: friendlyReview });
    } catch (e) {
      setOutput(`❌ Error reviewing code:\n${e.message}`);
      setActivePanel('console');
    } finally {
      setIsCompiling(false);
    }
  };

  // Generic AI Action Handler (Costs 10 energy)
  const handleAIAction = async (panelType, promptName) => {
    if (!code.trim()) {
        alert("Please write some code first before running AI Analysis!");
        return;
    }

    if (energy < 10) {
      triggerViolation("⚡ Insufficient Energy! You need at least 10 Mana points to run AI Smart Tools.");
      return;
    }
    
    setActivePanel(panelType);
    setAiLoading(true);
    setAiData(null);
    setEnergy(prev => Math.max(0, prev - 10));
    
    try {
      const modeInstruction = aiMode === 'Teaching' 
        ? 'Act as a patient teacher properly explaining concepts and helping.' 
        : aiMode === 'Helping' 
          ? 'Act as a helpful coding assistant.' 
          : 'Strictly assess the code as an interviewer without giving away the direct answer.';
          
      const response = await askGemini(`[Context: ${modeInstruction}]\nAnalyze this code:\n\n${code}`, promptName);
      let cleanJson = response;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const data = JSON.parse(cleanJson);
      setAiData(data);
    } catch (err) {
      console.error(err);
      setOutput(`Error parsing AI response: ${err.message}\n\nRaw Response: ${err}`);
      setActivePanel('console');
    } finally {
      setAiLoading(false);
    }
  };

  // Fetch New Practice Challenge
  const handleFetchChallenge = async () => {
    setChallengeLoading(true);
    setChallengeData(null);
    try {
      const response = await askGemini(`Generate a ${difficulty} level practice challenge.`, PRACTICE_CHALLENGE_PROMPT);
      let cleanJson = response;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const data = JSON.parse(cleanJson);
      setChallengeData(data);
      
      // Automatically load challenge boilerplate
      isInitialLoadRef.current = true;
      setCode(data.boilerplate || "// Write your code here");
      saveMilestone(data.boilerplate || "");
      if (onChange) onChange(data.boilerplate || "");
      
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    } catch (err) {
      console.error(err);
      setOutput(`Error generating challenge: ${err.message}`);
    } finally {
      setChallengeLoading(false);
    }
  };

  // Time Travel Timeline Scrubber
  const handleTimelineScrub = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (idx >= 0 && idx < historyTimeline.length) {
      isSlidingRef.current = true;
      setTimelineIndex(idx);
      const snapshot = historyTimeline[idx].code;
      setCode(snapshot);
      if (onChange) onChange(snapshot);
    }
  };

  const handleTimelineRelease = () => {
    // Resume auto-timeline saving after drag finishes
    isSlidingRef.current = false;
  };

  // Monaco Editor Mounting & Setup
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Disallow pasting completely via keyboard listener
    editor.onKeyDown((e) => {
      // Intercept Ctrl+V or Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Direct pasting (Ctrl+V / Cmd+V) is blocked to enforce active learning!");
      }
    });

    // Setup autocomplete inline provider
    setupGhostTextAutocomplete(monaco, selectedLanguage);
  };

  // AI Typing assistant: Register Inline Completion
  const setupGhostTextAutocomplete = (monaco, lang) => {
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
    }

    let typingTimeout = null;
    const fetchGhostText = (codeText) => {
      return new Promise((resolve) => {
        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(async () => {
          if (!ghostTextEnabledRef.current) {
            resolve('');
            return;
          }
          try {
            const prompt = `Given this partial code block:\n\n${codeText}\n\nPredict the next line or short continuation of code. Respond ONLY with the suggested continuation code (maximum 1 line or 50 characters) and do not wrap it in markdown formatting. If no continuation fits, return nothing.`;
            const suggestion = await askGemini(prompt, GHOST_TEXT_PROMPT);
            let clean = suggestion.trim();
            if (clean.includes('```')) {
              clean = clean.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '').trim();
            }
            resolve(clean);
          } catch {
            resolve('');
          }
        }, 1200); // 1.2s typing pause debounce
      });
    };

    completionProviderRef.current = monaco.languages.registerInlineCompletionsProvider(lang, {
      provideInlineCompletions: async (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        if (textUntilPosition.trim().length === 0) return;

        const suggestion = await fetchGhostText(textUntilPosition);
        if (!suggestion) return;

        return {
          items: [
            {
              insertText: suggestion,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              )
            }
          ]
        };
      },
      freeInlineCompletions: () => {}
    });
  };

  // Handle value change inside Monaco
  const handleEditorChange = (value, event) => {
    setCode(value);
    if (onChange) onChange(value);

    // Keystroke Velocity & Integrity Monitor
    if (isInitialLoadRef.current) return;

    if (event && event.changes) {
      for (const change of event.changes) {
        const lineCount = change.text.split('\n').length;
        const textLen = change.text.length;
        const now = Date.now();

        // 1. Detect large text dumps (e.g. bypass paste block using browser scripts or drop tools)
        if (lineCount > 10 || textLen > 250) {
          triggerViolation("Automated input / code dump detected! Cheat shield activated.");
          revertToLastTimeline();
          return;
        }

        // 2. Measure keystroke speed intervals (detect high-speed macros)
        if (lastKeystrokeTimeRef.current) {
          const delay = now - lastKeystrokeTimeRef.current;
          if (delay < 8 && textLen > 0) { // faster than 8ms
            fastKeystrokesCountRef.current += 1;
            if (fastKeystrokesCountRef.current >= 5) {
              triggerViolation("Automated typing macro detected. Please code manually!");
              fastKeystrokesCountRef.current = 0;
              revertToLastTimeline();
              return;
            }
          } else {
            fastKeystrokesCountRef.current = 0;
          }
        }
        lastKeystrokeTimeRef.current = now;
      }
    }
  };

  const revertToLastTimeline = () => {
    if (historyTimeline.length > 0) {
      const restore = historyTimeline[historyTimeline.length - 1].code;
      setCode(restore);
    }
  };

  const triggerViolation = (msg) => {
    setViolationCount(prev => {
      const nextCount = prev + 1;
      setLocalViolation({
        message: msg,
        count: nextCount
      });
      return nextCount;
    });
  };

  const handlePasteBlock = (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerViolation("Pasting is strictly disabled in Code Arena to enforce active learning!");
  };

  // Clean up completion registrations on unmount
  useEffect(() => {
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, []);

  const renderAntigravity = () => {
    if (!aiData) return null;
    return (
      <div className="p-4 space-y-5 overflow-y-auto h-full flex flex-col">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <span className="text-xs font-bold text-slate-300">Antigravity Analysis</span>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${aiData.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {aiData.status} ({aiData.score}/100)
          </span>
        </div>
        
        <div>
           <div className="flex justify-between text-xs mb-1 font-bold">
             <span className="text-cyan-400">Complexity Predictor</span>
           </div>
           <p className="text-xs text-slate-400 leading-relaxed bg-black/30 p-2 rounded border border-white/5 font-mono">
             {aiData.complexity}
           </p>
        </div>

        <div>
           <div className="flex justify-between text-xs mb-1 font-bold">
             <span className="text-purple-400">Logic Feedback</span>
           </div>
           <p className="text-xs text-slate-300 leading-relaxed bg-purple-900/10 p-3 rounded-lg border border-purple-500/20">
             {aiData.logicFeedback}
           </p>
        </div>

        {aiData.optimizedCode && (
           <div className="flex-1 min-h-[100px] flex flex-col">
             <div className="text-xs font-bold text-emerald-400 mb-1">Optimized Blueprint</div>
             <div className="flex-1 bg-black/50 p-3 rounded-lg border border-emerald-500/20 font-mono text-[10px] text-emerald-300 overflow-y-auto whitespace-pre-wrap">
               {aiData.optimizedCode}
             </div>
           </div>
        )}
      </div>
    );
  };

  const renderDryRun = () => {
    if (!aiData || !aiData.steps) return null;
    return (
      <div className="p-3 overflow-y-auto h-full space-y-2">
        <div className="sticky top-0 bg-[#0d1117] py-2 border-b border-white/10 z-10 flex justify-between items-end mb-3">
           <h4 className="text-xs font-bold text-emerald-400">Step-by-Step State Trace</h4>
           <div className="text-[10px] text-slate-500 font-mono">Input: {aiData.sampleInputUsed}</div>
        </div>
        {aiData.steps.map((step, idx) => (
          <div key={idx} className="bg-black/30 p-2 rounded-lg border border-white/5 flex gap-3 text-xs animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">{step.stepNumber}</div>
            <div className="flex-1">
              <div className="font-mono text-cyan-300 mb-0.5 text-[10px] bg-black/40 px-1 py-0.5 inline-block rounded">{step.lineNumber}</div>
              <div className="font-mono text-amber-300 mb-1">{step.variableStates}</div>
              <div className="text-slate-400 leading-relaxed">{step.explanation}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCodeExplainer = () => {
    if (!aiData) return null;
    return (
      <div className="p-4 h-full flex flex-col overflow-y-auto space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <BookOpen className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-slate-300">AI Code Explainer</span>
        </div>
        <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/20 text-xs text-orange-200 leading-relaxed">
          <span className="font-bold">Overview:</span> {aiData.summary}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logic Breakdown</div>
          {aiData.explanationSteps && aiData.explanationSteps.map((step, idx) => (
            <div key={idx} className="bg-black/30 p-2.5 rounded border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
              {step}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div>
            <span className="font-bold text-cyan-400">Time Complexity</span>
            <div className="text-slate-300 mt-1 font-mono">{aiData.timeComplexity}</div>
          </div>
          <div>
            <span className="font-bold text-purple-400">Space Complexity</span>
            <div className="text-slate-300 mt-1 font-mono">{aiData.spaceComplexity}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderCleanCode = () => {
    if (!aiData) return null;
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-slate-800 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="40" className="stroke-slate-800" strokeWidth="8" fill="none" />
            <circle cx="48" cy="48" r="40" className={`stroke-${aiData.score > 80 ? 'emerald' : aiData.score > 50 ? 'amber' : 'rose'}-500`} strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * aiData.score) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="text-2xl font-black text-white z-10">{aiData.score}</div>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-200">{aiData.verdict}</div>
          <div className="text-[10px] text-slate-400 mt-1">{aiData.naming}</div>
        </div>
        <div className="w-full text-left bg-black/30 p-2 rounded border border-white/5">
          <div className="text-[10px] font-bold text-sky-400 mb-1">Top Suggestion:</div>
          <div className="text-xs text-slate-300">{aiData.suggestion}</div>
        </div>
      </div>
    );
  };

  const renderMistakes = () => {
    if (!aiData || !aiData.review) return null;
    return (
      <div className="p-4 overflow-y-auto h-full space-y-4 flex flex-col">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">AI Tutor Code Review</span>
        </div>
        <div className="flex-1 bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
          {aiData.review}
        </div>
        <div className="text-[10px] text-slate-500 italic">
          💡 Reviewing code points out logic mistakes conceptually without spoiling solutions.
        </div>
      </div>
    );
  };

  const renderChallenge = () => {
    if (challengeLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 h-full p-4">
          <Cpu className="w-8 h-8 text-rose-400 animate-pulse" />
          <span className="text-xs font-bold text-rose-400 tracking-widest uppercase animate-pulse">Generating Challenge...</span>
        </div>
      );
    }
    if (!challengeData) return null;
    return (
      <div className="p-4 h-full flex flex-col overflow-y-auto space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-400" /> {challengeData.title}
          </h3>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${challengeData.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : challengeData.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {challengeData.difficulty}
          </span>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          {challengeData.description}
        </div>
        <div className="bg-black/40 p-3 rounded-lg border border-white/5 mt-auto">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Example</div>
          <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap">{challengeData.examples}</pre>
        </div>
      </div>
    );
  };

  // Energy/Mana color calculator
  const getEnergyColor = () => {
    if (energy > 50) return 'from-emerald-500 to-teal-400 shadow-emerald-500/30';
    if (energy > 20) return 'from-amber-500 to-orange-400 shadow-amber-500/30';
    return 'from-rose-600 to-red-500 shadow-rose-500/40 animate-pulse';
  };

  return (
    <div className={`dark min-h-[500px] flex flex-col border border-slate-700 dark:border-white/5 rounded-2xl relative z-10 overflow-hidden transition-all duration-700 shadow-2xl ${antigravityMode ? 'antigravity-bg shadow-[0_0_50px_rgba(139,92,246,0.3)] border-purple-500/30' : 'bg-[#0d1117]'}`}>
      
      {/* Local proctoring / violation overlay */}
      {localViolation && (
        <div className="absolute inset-0 bg-[#060413]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center animate-fade-in">
          <div className="max-w-md w-full glass-panel border border-rose-500/40 p-8 rounded-3xl shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="w-8 h-8 text-rose-400 animate-bounce" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400">
              Violation #{localViolation.count} Recorded
            </div>
            <h3 className="text-lg font-black text-white mb-2">Arena Integrity Protection</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">{localViolation.message}</p>
            <button
              onClick={() => setLocalViolation(null)}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-rose-500/20"
            >
              I Understand — Return to Arena
            </button>
          </div>
        </div>
      )}

      {/* Top HUD Controls Header */}
      <div className="flex flex-wrap items-center justify-between p-3 border-b border-slate-700 dark:border-white/10 bg-slate-800/80 dark:bg-slate-900/50 backdrop-blur-md z-10 gap-2">
        <div className="flex items-center gap-2 text-xs font-display font-bold text-white/80 uppercase tracking-wider min-w-fit">
          <Code2 className="w-4 h-4 text-cognitive-primary" />
          Isolated {selectedLanguage} Sandbox
        </div>

        {/* Dynamic Selectors */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select 
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-[11px] font-semibold bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 rounded-md px-2 py-1 text-white/90 outline-none hover:border-primary-400 transition-colors cursor-pointer"
            title="Compilation Language"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="go">Go Lang</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="html">HTML Preview</option>
            <option value="css">CSS stylesheet</option>
          </select>

          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="text-[11px] font-semibold bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 rounded-md px-2 py-1 text-white/90 outline-none hover:border-primary-400 transition-colors cursor-pointer"
            title="Challenge Difficulty"
          >
            <option value="Beginner">Beginner Level</option>
            <option value="Intermediate">Intermediate Level</option>
            <option value="Professional">Professional Level</option>
          </select>
          <select 
            value={aiMode}
            onChange={(e) => setAiMode(e.target.value)}
            className="text-[11px] font-semibold bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 rounded-md px-2 py-1 text-white/90 outline-none hover:border-primary-400 transition-colors cursor-pointer"
            title="AI Assistance Mode"
          >
            <option value="Teaching">Teaching Mode</option>
            <option value="Helping">Helping Mode</option>
            <option value="Assessing">Assessment Mode</option>
          </select>
        </div>

        <div className="flex gap-2 min-w-fit ml-auto">
          {/* Antigravity Toggle */}
          <Button 
            size="sm" 
            variant={antigravityMode ? 'primary' : 'ghost'} 
            onClick={() => setAntigravityMode(!antigravityMode)} 
            icon={Moon} 
            className={`${antigravityMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/40 text-white' : 'text-slate-400'} py-1 border-none`}
            title="Toggle Antigravity Error Mode"
          >
            Antigravity
          </Button>

          <Button size="sm" variant="ghost" onClick={handleReset} icon={RefreshCw} className="text-slate-400 hover:text-slate-200 py-1">
            Reset
          </Button>
          <Button size="sm" variant="primary" onClick={handleRunCode} disabled={isCompiling} icon={isCompiling ? undefined : Play} className="bg-emerald-600 hover:bg-emerald-500 text-white py-1">
            {isCompiling ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Timeline Time Travel & Energy Status Panel */}
      <div className="bg-slate-900/40 border-b border-white/5 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 text-xs text-slate-300">
        
        {/* Time Travel Timeline Scrub Slider */}
        <div className="flex items-center gap-3 flex-1">
          <RotateCcw className="w-3.5 h-3.5 text-cognitive-primary shrink-0" />
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 min-w-fit">Timeline:</span>
          
          <button 
            disabled={timelineIndex <= 0}
            onClick={() => handleTimelineScrub({ target: { value: timelineIndex - 1 }})}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <input 
            type="range"
            min="0"
            max={historyTimeline.length - 1}
            value={timelineIndex}
            onChange={handleTimelineScrub}
            onMouseUp={handleTimelineRelease}
            onTouchEnd={handleTimelineRelease}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cognitive-primary"
            style={{ padding: 0 }}
          />

          <button 
            disabled={timelineIndex >= historyTimeline.length - 1}
            onClick={() => handleTimelineScrub({ target: { value: timelineIndex + 1 }})}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          
          <span className="font-mono text-[10px] text-slate-400 bg-black/30 px-2 py-0.5 rounded border border-white/5 shrink-0">
            {timelineIndex >= 0 ? `${timelineIndex + 1}/${historyTimeline.length}` : '0/0'}
          </span>
        </div>

        {/* Energy (Mana) points bar */}
        <div className="flex items-center gap-3 shrink-0 min-w-[200px]">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-bold text-[10px] uppercase tracking-widest text-slate-400 shrink-0">Arena Mana:</span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${getEnergyColor()} shadow-[0_0_10px_#000] transition-all duration-300`} 
              style={{ width: `${energy}%` }} 
            />
          </div>
          <span className="font-mono font-bold text-white shrink-0 bg-slate-900/60 px-2 py-0.5 rounded-md border border-white/10">
            {energy}⚡
          </span>
        </div>

        {/* Ghost text toggle */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-3 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Autocomplete:</span>
          <button
            onClick={() => setGhostTextEnabled(!ghostTextEnabled)}
            className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${ghostTextEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${ghostTextEnabled ? 'translate-x-3' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
      
      {/* Editor & Side Panel Area */}
      <div className="flex-1 flex flex-col sm:flex-row z-10 min-h-[350px]">
        
        {/* Left Problem Panel */}
        {(challengeData || challengeLoading) && (
          <div className="sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-700 dark:border-white/10 bg-slate-800/50 dark:bg-slate-900/40 relative">
            {renderChallenge()}
          </div>
        )}

        {/* Main Code Editor Wrapper */}
        <div 
          className="flex-1 relative min-h-[300px] flex flex-col bg-[#1e1e1e]"
          onPaste={handlePasteBlock}
        >
          {/* Monaco Code Editor */}
          <Editor
            height="100%"
            language={selectedLanguage}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              selectOnLineNumbers: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
              contextmenu: false, // Block right click menu entirely
              dragAndDrop: false, // Disallow mouse drag-and-drop texts
              lineHeight: 20,
              padding: { top: 12 },
              wordWrap: 'on',
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto'
              }
            }}
          />

          {/* Floating Action Button: AI Review mistake detector */}
          <button
            onClick={handleReviewCode}
            disabled={isCompiling}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-1.5 border border-white/20 active:scale-95 transition-all z-20 group"
          >
            <Lightbulb className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>Find My Mistake</span>
          </button>
        </div>
        
        {/* Right Side Panel (Console or AI Features) */}
        <div className="sm:w-1/3 border-t sm:border-t-0 sm:border-l border-slate-700 dark:border-white/10 bg-slate-800/30 dark:bg-black/40 flex flex-col relative overflow-hidden">
          
          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {aiLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80 dark:bg-[#0d1117]/80 backdrop-blur-sm z-20">
                <Cpu className="w-8 h-8 text-cognitive-primary animate-pulse" />
                <span className="text-xs font-bold text-cognitive-primary tracking-widest uppercase animate-pulse">Running AI Analysis...</span>
              </div>
            ) : null}

            {activePanel === 'console' && (
              <div className="p-3 font-mono text-xs overflow-y-auto h-full flex flex-col">
                <div className="text-white/60 mb-2 uppercase tracking-widest font-bold flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" /> Console Output
                </div>
                {selectedLanguage === 'html' ? (
                  <div className="flex-1 bg-white rounded-lg overflow-hidden border border-slate-700 h-full min-h-[250px] mt-1">
                    <iframe
                      title="HTML Preview"
                      srcDoc={output}
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts"
                    />
                  </div>
                ) : (
                  <pre className={`whitespace-pre-wrap ${antigravityMode && output.includes('ANTIGRAVITY SAYS') ? 'text-purple-300' : 'text-emerald-400'}`}>
                    {output || 'Ready.'}
                  </pre>
                )}
              </div>
            )}
            
            {activePanel === 'antigravity' && renderAntigravity()}
            {activePanel === 'dryrun' && renderDryRun()}
            {activePanel === 'explainer' && renderCodeExplainer()}
            {activePanel === 'clean' && renderCleanCode()}
            {activePanel === 'mistakes' && renderMistakes()}
          </div>
        </div>
      </div>

      {/* AI Toolbelt (Bottom Footer) */}
      <div className="bg-slate-900/90 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-700 dark:border-white/5 p-2 flex justify-between items-center z-10 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 flex items-center gap-1 pl-2">
          <Sparkles className="w-3 h-3" /> AI Smart Tools
        </span>
        <div className="flex gap-2 min-w-max">
          <Button 
            size="sm" variant={challengeData ? 'primary' : 'ghost'} 
            onClick={handleFetchChallenge} 
            icon={Target} 
            className={`${challengeData ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-rose-400'} py-1 px-2 text-[11px]`}
          >
            New Challenge
          </Button>
          <div className="w-px h-4 bg-white/10 mx-1 self-center" />
          <Button 
            size="sm" variant={activePanel === 'antigravity' ? 'primary' : 'ghost'} 
            onClick={() => handleAIAction('antigravity', ANTIGRAVITY_CODING_SPACE_PROMPT)} 
            icon={Activity} 
            className={`${activePanel === 'antigravity' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-cyan-400'} py-1 px-2 text-[11px]`}
          >
            Antigravity Analysis
          </Button>
          <Button 
            size="sm" variant={activePanel === 'dryrun' ? 'primary' : 'ghost'} 
            onClick={() => handleAIAction('dryrun', DRY_RUN_PROMPT)} 
            icon={Check} 
            className={`${activePanel === 'dryrun' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-emerald-400'} py-1 px-2 text-[11px]`}
          >
            Dry Run
          </Button>
          <Button 
            size="sm" variant={activePanel === 'explainer' ? 'primary' : 'ghost'} 
            onClick={() => handleAIAction('explainer', CODE_EXPLAINER_PROMPT)} 
            icon={BookOpen} 
            className={`${activePanel === 'explainer' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-orange-400'} py-1 px-2 text-[11px]`}
          >
            Code Explainer
          </Button>
          <Button 
            size="sm" variant={activePanel === 'clean' ? 'primary' : 'ghost'} 
            onClick={() => handleAIAction('clean', CLEAN_CODE_PROMPT)} 
            icon={ShieldCheck} 
            className={`${activePanel === 'clean' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-sky-400'} py-1 px-2 text-[11px]`}
          >
            Clean Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeSandbox;
