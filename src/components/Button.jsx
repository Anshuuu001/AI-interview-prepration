import React from 'react';
import { useDesign } from '../context/DesignContext';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const { designStyle } = useDesign();

  let base = 'group inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none relative overflow-hidden';
  
  if (designStyle === 'brutalist') {
    base = 'brutalist-btn inline-flex items-center justify-center';
  } else if (designStyle === 'minimal') {
    base = 'inline-flex items-center justify-center font-semibold rounded-md border transition-colors duration-150 focus:outline-none disabled:opacity-50 select-none';
  }

  const variants = {
    primary: {
      style: {
        background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#fff',
        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.35), inset 0 2px 4px rgba(255,255,255,0.2)',
      },
      hoverStyle: {},
      className: 'hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_12px_24px_-5px_rgba(79,70,229,0.5),_inset_0_2px_4px_rgba(255,255,255,0.4)] active:translate-y-0 active:scale-[0.98] transition-all duration-300',
    },
    secondary: {
      style: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        color: 'var(--link-color)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      },
      className: 'hover:bg-white/20 hover:border-white/40 active:scale-[0.98] transition-all duration-200',
    },
    outline: {
      style: {
        background: 'transparent',
        border: '1px solid var(--sidebar-border)',
        color: 'var(--link-color)',
      },
      className: 'hover:bg-white/10 hover:border-primary-400 active:scale-[0.98] transition-all duration-200',
    },
    danger: {
      style: {
        background: 'linear-gradient(135deg, #dc2626, #e11d48)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        boxShadow: '0 4px 20px -5px rgba(220,38,38,0.5)',
      },
      className: 'hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-5px_rgba(220,38,38,0.6)] active:translate-y-0 active:scale-[0.98] transition-all duration-200',
    },
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  let v = { ... (variants[variant] || variants.primary) };

  // Brutalist overrides
  if (designStyle === 'brutalist') {
    v.style = {};
    v.className = '';
  }

  // Minimal overrides
  if (designStyle === 'minimal') {
    v.style = {};
    if (variant === 'primary') {
      v.className = 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white border-transparent';
    } else {
      v.className = 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700';
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={designStyle === 'glass' ? v.style : {}}
      className={`${base} ${v.className} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Animated Shine Effect */}
      {designStyle === 'glass' && variant === 'primary' && !disabled && !loading && (
        <div className="absolute top-0 -left-[100%] h-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[200%] transition-all duration-700 ease-in-out pointer-events-none z-10" />
      )}
      
      <div className="relative z-20 flex items-center justify-center gap-inherit w-full h-full pointer-events-none">
        {loading ? (
          <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : Icon ? (
          <Icon className={`w-4 h-4 flex-shrink-0 ${children ? 'mr-1' : 'm-0'}`} />
        ) : null}
        {children}
      </div>
    </button>
  );
};

export default Button;
