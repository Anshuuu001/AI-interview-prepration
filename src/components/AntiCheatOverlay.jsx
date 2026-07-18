import React from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';

/**
 * AntiCheatOverlay
 * – Full-screen blur overlay shown when a violation occurs.
 * – Shows the violation count badge and a dismissible warning card.
 */
const AntiCheatOverlay = ({ show, message, warningCount, onDismiss }) => {
  if (!show) return null;

  const isSevere = warningCount >= 3;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        background: 'rgba(10, 6, 30, 0.75)',
      }}
    >
      {/* Warning card */}
      <div
        className="relative max-w-md w-full mx-4 rounded-3xl p-7 text-center shadow-2xl animate-fade-in-up"
        style={{
          background: isSevere
            ? 'linear-gradient(145deg, rgba(239,68,68,0.18) 0%, rgba(20,14,45,0.97) 100%)'
            : 'linear-gradient(145deg, rgba(245,158,11,0.15) 0%, rgba(20,14,45,0.97) 100%)',
          border: isSevere
            ? '1px solid rgba(239,68,68,0.4)'
            : '1px solid rgba(245,158,11,0.35)',
          boxShadow: isSevere
            ? '0 0 60px -15px rgba(239,68,68,0.4), 0 25px 50px rgba(0,0,0,0.5)'
            : '0 0 60px -15px rgba(245,158,11,0.3), 0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
          isSevere
            ? 'bg-rose-500/20 border border-rose-500/30'
            : 'bg-amber-500/20 border border-amber-500/30'
        }`}>
          <ShieldAlert className={`w-8 h-8 ${isSevere ? 'text-rose-400' : 'text-amber-400'}`} />
        </div>

        {/* Violation count badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
          isSevere
            ? 'bg-rose-500/15 border border-rose-500/25 text-rose-400'
            : 'bg-amber-500/15 border border-amber-500/25 text-amber-400'
        }`}>
          <AlertTriangle className="w-3 h-3" />
          Violation #{warningCount} {isSevere ? '— Final Warning' : 'Recorded'}
        </div>

        {/* Heading */}
        <h3 className="text-xl font-black text-white mb-3 tracking-tight">
          {isSevere ? 'Critical Integrity Breach' : 'Security Violation Detected'}
        </h3>

        {/* Message */}
        <p className="text-sm text-white-force leading-relaxed mb-6">
          {message}
        </p>

        {isSevere && (
          <p className="text-xs text-rose-400 font-semibold mb-5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/15">
            ⚠️ Further violations may result in automatic submission and disqualification.
          </p>
        )}

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95"
          style={{
            background: isSevere
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: isSevere
              ? '0 4px 20px rgba(239,68,68,0.35)'
              : '0 4px 20px rgba(245,158,11,0.35)',
            color: '#fff',
          }}
        >
          I Understand — Continue Assessment
        </button>

        {/* Close icon */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AntiCheatOverlay;
