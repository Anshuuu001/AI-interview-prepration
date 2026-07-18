import React from 'react';
import { useDesign } from '../context/DesignContext';
import { Palette, Layers, Minimize, Paintbrush } from 'lucide-react';

const DesignSwitcher = () => {
  const { designStyle, changeDesignStyle } = useDesign();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-xl">
      <div className="px-2 text-xs font-semibold text-slate-300 uppercase tracking-wider hidden sm:flex items-center gap-1.5">
        <Palette className="w-3.5 h-3.5" />
        GenUI Engine
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={() => changeDesignStyle('glass')}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            designStyle === 'glass' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
              : 'hover:bg-slate-700/50 text-slate-400'
          }`}
          title="Liquid Glass (Glassmorphism 2.0)"
        >
          <Layers className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => changeDesignStyle('minimal')}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            designStyle === 'minimal' 
              ? 'bg-slate-200 text-slate-900 shadow-lg' 
              : 'hover:bg-slate-700/50 text-slate-400'
          }`}
          title="Structural Minimalism (SaaS)"
        >
          <Minimize className="w-4 h-4" />
        </button>

        <button
          onClick={() => changeDesignStyle('brutalist')}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            designStyle === 'brutalist' 
              ? 'bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'hover:bg-slate-700/50 text-slate-400'
          }`}
          title="Neo-Brutalism"
        >
          <Paintbrush className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DesignSwitcher;
