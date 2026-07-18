import React, { useState } from 'react';

const Tilt = ({ children, className = '', maxTilt = 15, scale = 1.03, ...props }) => {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [shineStyle, setShineStyle] = useState({
    opacity: 0,
    transform: 'translateX(-50%) translateY(-50%)',
  });

  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    
    // Relative coordinates within the element (from 0 to width/height)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates from -0.5 to 0.5
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    // Map to tilt angles (maxTilt)
    const tiltX = -normY * maxTilt;
    const tiltY = normX * maxTilt;
    
    setTransform(`perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`);
    
    // Move shine reflection overlay
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    setShineStyle({
      opacity: 0.15,
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.8) 0%, transparent 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setShineStyle({
      opacity: 0,
      transform: 'translateX(-50%) translateY(-50%)',
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease',
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-xl overflow-hidden ${className}`}
      {...props}
    >
      {/* 3D shine effect layer */}
      <div
        className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
        style={shineStyle}
      />
      {children}
    </div>
  );
};

export default Tilt;
