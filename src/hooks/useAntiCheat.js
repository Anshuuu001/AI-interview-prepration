import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * useAntiCheat — prevents screenshot, paste, tab-switching, right-click, zoom abuse,
 * network disconnection, and Developer Tools inspection during a live session.
 *
 * @param {object} options
 * @param {boolean} options.active       – enable/disable the hook (default: true)
 * @param {function} options.onViolation – callback(count, message) on each violation
 */
const useAntiCheat = ({ active = true, onViolation } = {}) => {
  const [warningCount, setWarningCount]     = useState(0);
  const [showWarning, setShowWarning]       = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isBlurred, setIsBlurred]           = useState(false);
  const [isOnline, setIsOnline]             = useState(navigator.onLine);
  
  const lastWarningRef = useRef(0);

  const dismiss = useCallback(() => setShowWarning(false), []);

  const triggerWarning = useCallback((message) => {
    const now = Date.now();
    // 3-second cooldown on consecutive anti-cheat warnings to prevent duplicate strikes
    if (now - lastWarningRef.current < 3000) {
      return;
    }
    lastWarningRef.current = now;
    setWarningMessage(message);
    setShowWarning(true);
    setWarningCount(prev => {
      const n = prev + 1;
      if (onViolation) onViolation(n, message);
      return n;
    });
  }, [onViolation]);

  useEffect(() => {
    if (!active) return;

    /* ── Tab / Window Visibility ── */
    const onVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
        triggerWarning('⚠️ Tab switching detected! Stay on this page during the assessment. This violation has been logged.');
      } else {
        setIsBlurred(false);
      }
    };

    /* ── Window Blur (Focus Lost / Alt+Tab / Minimize) ── */
    const onBlur = () => {
      setIsBlurred(true);
      triggerWarning('⚠️ Focus lost! Ensure you do not switch to another application or tab.');
    };

    const onFocus = () => {
      setIsBlurred(false);
    };

    /* ── Keyboard shortcuts & DevTools block ── */
    const onKeyDown = (e) => {
      // 1. Block PrintScreen / Screenshot Key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        navigator.clipboard?.writeText('').catch(() => {});
        triggerWarning('📸 Screenshot attempt blocked! This activity has been recorded.');
        return;
      }
      
      // 2. Detect Snipping Tool/Screenshot shortcuts (Win+Shift+S, Cmd+Shift+3/4/5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (['s', 'S', '3', '4', '5'].includes(e.key)) {
          e.preventDefault();
          navigator.clipboard?.writeText('').catch(() => {});
          triggerWarning('📸 Screenshot shortcut detected! Taking screenshots is prohibited.');
          return;
        }
      }

      // 3. Block Copy/Paste/Cut/Select All/Undo keys
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        
        // Block Ctrl+C (copy), Ctrl+V (paste), Ctrl+X (cut), Ctrl+A (select all), Ctrl+Z (undo)
        if (['c', 'v', 'x', 'a', 'z', 'p', 's'].includes(key)) {
          e.preventDefault();
          if (key === 'v') {
            triggerWarning('📋 Pasting is not allowed during the assessment.');
          } else if (key === 'c') {
            triggerWarning('🚫 Copying is disabled to protect content privacy.');
          } else if (key === 'x') {
            triggerWarning('🚫 Cutting text is disabled during the assessment.');
          } else if (key === 'a') {
            triggerWarning('🚫 Select All is disabled during the assessment.');
          } else if (key === 'z') {
            triggerWarning('🚫 Undo is disabled during the assessment.');
          } else {
            triggerWarning('🚫 This action is disabled during the assessment.');
          }
          return;
        }

        // Block Ctrl+U / Cmd+U (View Source)
        if (key === 'u') {
          e.preventDefault();
          triggerWarning('🔒 Viewing page source is disabled.');
          return;
        }
      }

      // 4. Block F12 and Ctrl+Shift+I/C/J Developer Tools
      if (e.key === 'F12') {
        e.preventDefault();
        triggerWarning('🔒 Developer tools are disabled during the assessment.');
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (['i', 'c', 'j'].includes(key)) {
          e.preventDefault();
          triggerWarning('🔒 Developer inspection shortcuts are blocked.');
          return;
        }
      }
    };

    /* ── Right-click context menu ── */
    const onContextMenu = (e) => {
      e.preventDefault();
      triggerWarning('🚫 Right-clicking is disabled during the assessment.');
    };

    /* ── Drag & Drop ── */
    const onDragStart = (e) => {
      e.preventDefault();
    };
    const onDrop = (e) => {
      e.preventDefault();
    };

    /* ── Text selection ── */
    const onSelectStart = (e) => {
      if (!['TEXTAREA', 'INPUT'].includes(e.target.tagName)) {
        e.preventDefault();
      }
    };

    /* ── Native Clipboard Events ── */
    const onPaste = (e) => {
      e.preventDefault();
      triggerWarning('📋 Pasting is not allowed during the assessment.');
    };
    const onCopy = (e) => {
      e.preventDefault();
      triggerWarning('🚫 Copying is disabled to protect content privacy.');
    };
    const onCut = (e) => {
      e.preventDefault();
      triggerWarning('🚫 Cutting text is disabled during the assessment.');
    };

    /* ── Network Connection Listeners ── */
    const onOnline = () => {
      setIsOnline(true);
    };
    const onOffline = () => {
      setIsOnline(false);
      triggerWarning('📡 Internet connection lost. Timer has been paused.');
    };

    // Attach listeners
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('keydown', onKeyDown, { capture: true });
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('selectstart', onSelectStart);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('drop', onDrop);
    document.addEventListener('paste', onPaste);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('keydown', onKeyDown, { capture: true });
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('selectstart', onSelectStart);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [active, triggerWarning]);

  return { warningCount, showWarning, warningMessage, isBlurred, isOnline, dismiss, triggerWarning };
};

export default useAntiCheat;
