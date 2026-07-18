import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

const AntiCheatPopup = () => {
  const [violation, setViolation] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Detect PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        triggerViolation('Screenshot Detected! This action is prohibited by our privacy policy.');
      }
      // Detect Snipping Tool/Screenshot shortcuts (Win+Shift+S, Cmd+Shift+3/4/5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (['s', 'S', '3', '4', '5'].includes(e.key)) {
          triggerViolation('Screenshot shortcut detected! Taking screenshots is restricted.');
        }
      }
    };

    const handlePaste = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      e.preventDefault();
      triggerViolation('Pasting is disabled for security and academic integrity.');
    };
    
    const handleCopy = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      e.preventDefault();
      triggerViolation('Copying text is disabled to protect content privacy.');
    };

    // Add global event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('copy', handleCopy);
    };
  }, []);

  const triggerViolation = (message) => {
    setViolation(message);
    // Auto-hide the notification after 5 seconds
    setTimeout(() => {
      setViolation(null);
    }, 5000);
  };

  if (!violation) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
      <div className="glass-panel backdrop-blur-xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/50 shadow-[0_8px_30px_rgba(225,29,72,0.2)] rounded-2xl p-4 flex items-center gap-4 max-w-md w-[90vw]">
        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex flex-shrink-0 items-center justify-center border border-rose-500/30">
          <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-0.5 tracking-tight flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Anti-Cheat Shield Active
          </h4>
          <p className="text-xs text-rose-800/80 dark:text-rose-200/80 font-medium leading-relaxed">
            {violation}
          </p>
        </div>
        <button 
          onClick={() => setViolation(null)} 
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500/70 hover:text-rose-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AntiCheatPopup;
