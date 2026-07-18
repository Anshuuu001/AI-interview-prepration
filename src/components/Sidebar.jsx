import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import {
  LayoutDashboard, FileText, Video, ClipboardList, Camera,
  MessageSquare, ShieldCheck, Settings, LogOut, X, Zap, TrendingUp, Code2
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    if (onClose) onClose();
  };

  const studentLinks = [
    { to: '/dashboard',  label: getTranslation('dashboard'),        icon: LayoutDashboard, color: 'from-violet-500 to-indigo-500' },
    { to: '/analytics',  label: getTranslation('analytics'),        icon: TrendingUp,       color: 'from-fuchsia-500 to-indigo-500' },
    { to: '/interview',  label: getTranslation('interviews'),       icon: Video,            color: 'from-blue-500 to-cyan-500' },
    { to: '/video-interview', label: getTranslation('videoInterview'), icon: Camera,        color: 'from-emerald-500 to-teal-500' },
    { to: '/aptitude',   label: getTranslation('aptitudeTest'),    icon: ClipboardList,    color: 'from-amber-500 to-orange-500' },
    { to: '/practice',   label: getTranslation('codingPractice'),  icon: Code2,            color: 'from-rose-500 to-red-500' },
    { to: '/chat',       label: getTranslation('careerAssistant'), icon: MessageSquare,    color: 'from-indigo-500 to-purple-500' },
    { to: '/profile',    label: getTranslation('settings'),         icon: Settings,         color: 'from-slate-450 to-slate-550' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',  label: 'Super Admin',         icon: ShieldCheck, color: 'from-rose-500 to-pink-500' },
    { to: '/admin/questions',  label: 'Question Bank',       icon: Settings,    color: 'from-slate-400 to-slate-500' },
  ];

  const renderLinks = (links) =>
    links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => onClose && onClose()}
        className={({ isActive }) =>
          `sidebar-nav-link group ${isActive ? 'active' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${link.color} ${isActive ? 'shadow-lg shadow-indigo-500/20 scale-105' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'} transition-all duration-200`}>
              <link.icon className="w-4 h-4 text-white" />
            </span>
            <span className="font-sans font-medium transition-colors group-hover:text-slate-100">{link.label}</span>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cognitive-primary animate-pulse" />
            )}
          </>
        )}
      </NavLink>
    ));

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid var(--sidebar-border)',
          boxShadow: '4px 0 30px rgba(0,0,0,0.12)',
        }}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            {/* 3D Logo badge */}
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cognitive-primary to-cognitive-secondary flex items-center justify-center shadow-lg"
                style={{ boxShadow: '0 4px 14px rgba(79,70,229,0.35), 0 1px 0 rgba(255,255,255,0.2) inset' }}>
                <Zap className="w-4.5 h-4.5 text-white" fill="white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-slate-100">ElevateAI</span>
              <p className="text-[10px] text-cognitive-primary font-medium -mt-0.5">Career Platform</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-cognitive-primary hover:bg-cognitive-primary/10 border border-transparent hover:border-cognitive-primary/20 lg:hidden transition-all duration-200 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-display font-semibold text-slate-600 uppercase tracking-[0.15em] mb-3">
              {getTranslation('candidatePortal')}
            </p>
            {renderLinks(studentLinks)}
          </div>

          {user?.role === 'admin' && (
            <div className="space-y-1" style={{ borderTop: '1px solid rgba(139,92,246,0.1)', paddingTop: '1.25rem' }}>
              <p className="px-3 text-[10px] font-display font-semibold text-slate-600 uppercase tracking-[0.15em] mb-3">
                {getTranslation('administration')}
              </p>
              {renderLinks(adminLinks)}
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          {/* User card */}
          <div className="flex items-center gap-3 p-3 rounded-xl mb-2.5 bg-slate-900/5 dark:bg-white/5 border border-slate-200/50 dark:border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cognitive-primary to-cognitive-secondary flex items-center justify-center font-bold text-white text-sm shadow-md shadow-cognitive-primary/20 flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0 font-sans">
              <p className="text-sm font-semibold text-slate-100 truncate">{user?.name || 'Guest'}</p>
              <p className="text-[11px] text-slate-500 capitalize mt-0.5">{user?.role || 'Student'}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 bg-rose-500/5 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 border border-rose-500/15 hover:border-rose-500/25 text-rose-600 dark:text-rose-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group"
          >
            <LogOut className="w-3.5 h-3.5" />
            {getTranslation('signOut')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
