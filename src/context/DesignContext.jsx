import React, { createContext, useContext, useState, useEffect } from 'react';

const DesignContext = createContext(null);

export const DesignProvider = ({ children }) => {
  // designStyle can be 'glass', 'minimal', or 'brutalist'
  const [designStyle, setDesignStyle] = useState('minimal');

  useEffect(() => {
    const saved = localStorage.getItem('designStyle');
    if (saved) {
      setDesignStyle(saved);
    }
  }, []);

  const changeDesignStyle = (style) => {
    setDesignStyle(style);
    localStorage.setItem('designStyle', style);
  };

  return (
    <DesignContext.Provider value={{ designStyle, changeDesignStyle }}>
      {/* We apply a wrapper class that can affect children if needed */}
      <div className={`design-theme-${designStyle} min-h-screen transition-all duration-500`}>
        {children}
      </div>
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) throw new Error('useDesign must be used within a DesignProvider');
  return context;
};
