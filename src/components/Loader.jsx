import React from 'react';

const Loader = ({
  message = 'Processing details...',
  size = 'md',
  fullPage = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className={`absolute rounded-full border border-primary-500/30 animate-ping opacity-75 ${sizeClasses[size]}`} />
        
        {/* Middle spinning gradient ring */}
        <div className={`rounded-full border-4 border-slate-800 border-t-primary-500 animate-spin ${sizeClasses[size]}`} />

        {/* Inner static AI brain glow */}
        <div className="absolute w-4 h-4 rounded-full bg-primary-400 blur-[2px] animate-pulse" />
      </div>
      
      {message && (
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-300 animate-pulse tracking-wide">{message}</p>
          <p className="text-xs text-slate-500 mt-1">Please do not refresh or close this tab</p>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="glass-panel p-8 rounded-2xl max-w-sm mx-4">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
