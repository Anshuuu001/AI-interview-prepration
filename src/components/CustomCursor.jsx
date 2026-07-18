import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseOver = (e) => {
      const interactiveElements = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
      const isInteractive = interactiveElements.includes(e.target.tagName) || 
                            e.target.closest('button') || 
                            e.target.closest('a') ||
                            e.target.closest('[role="button"]') ||
                            e.target.classList.contains('material-interactive') ||
                            e.target.classList.contains('cursor-pointer') ||
                            window.getComputedStyle(e.target).cursor === 'pointer';
      setIsHovering(!!isInteractive);
    };
    
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] transition-all duration-150 ease-out transform-gpu shadow-[0_0_10px_rgba(139,92,246,0.8)] ${isHovering ? 'scale-[2.5] bg-cyan-400 mix-blend-screen' : 'bg-primary-500 scale-100'}`}
        style={{ transformOrigin: 'center center', marginLeft: '-4px', marginTop: '-4px' }}
      />
      <div 
        ref={followerRef}
        className={`fixed top-0 left-0 w-8 h-8 border rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out transform-gpu ${isHovering ? 'scale-150 border-cyan-400/60 bg-cyan-400/10 backdrop-blur-sm' : 'scale-100 border-primary-500/40 bg-primary-500/5'}`}
        style={{ transformOrigin: 'center center', marginLeft: '-16px', marginTop: '-16px' }}
      />
    </>
  );
};

export default CustomCursor;
