import React from 'react';
import Tilt from './Tilt';
import { useDesign } from '../context/DesignContext';

const Card = ({
  children,
  title,
  subtitle,
  actions,
  footer,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const { designStyle } = useDesign();

  // Determine base classes based on the GenUI style
  let styleClasses = 'liquid-glass-card';
  if (designStyle === 'minimal') styleClasses = 'minimal-surface';
  if (designStyle === 'brutalist') styleClasses = 'brutalist-card';

  const cardContent = (
    <div
      className={`${styleClasses} w-full ${className}`}
      {...(!hoverEffect ? props : {})}
    >
      {/* Glossy top sheen - liquid edge (only for glass mode) */}
      {designStyle === 'glass' && (
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden" style={{ zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 15%, transparent 100%)',
            borderRadius: 'inherit',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4)'
          }} />
        </div>
      )}

      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="relative z-10 px-6 py-5 flex items-center justify-between gap-4"
          style={{ borderBottom: '1px solid var(--card-border, rgba(255,255,255,0.05))' }}>
          <div>
            {title && (
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-sm text-slate-600 mt-1 font-normal">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Body */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="relative z-10 px-6 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--card-border, rgba(255,255,255,0.05))', background: 'rgba(255,255,255,0.01)' }}>
          {footer}
        </div>
      )}
    </div>
  );

  if (hoverEffect) {
    return (
      <Tilt className="h-full w-full" scale={1.02} maxTilt={8} {...props}>
        {cardContent}
      </Tilt>
    );
  }

  return cardContent;
};

export default Card;
