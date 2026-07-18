import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown, Bell, Shield, Globe, Award, BookOpen, BellRing } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/formatters';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeLang, setActiveLang] = useState(() => localStorage.getItem('language') || 'english');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, readIds, markAsRead, markAllAsRead } = useNotifications();

  const selectLanguage = (lang) => {
    localStorage.setItem('language', lang);
    setActiveLang(lang);
    setShowLangDropdown(false);
    window.location.reload();
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-5 flex-shrink-0"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--navbar-border)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/5 lg:hidden transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Status pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          {getTranslation('aiEngineOnline')}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95 bg-cognitive-primary/5 hover:bg-cognitive-primary/10 border border-cognitive-primary/20 text-cognitive-primary font-sans"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="capitalize">{activeLang === 'english' ? 'English' : activeLang === 'hindi' ? 'हिंदी' : 'मराठी'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showLangDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowLangDropdown(false)} />
              <div
                className="absolute right-0 mt-2 w-36 z-40 rounded-2xl p-1.5 animate-fade-in-up glass-panel border border-cognitive-outline-variant/20 shadow-xl"
                style={{
                  background: 'var(--sidebar-bg)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                {['english', 'hindi', 'marathi'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => selectLanguage(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs capitalize transition-colors font-sans ${
                      activeLang === lang
                        ? 'bg-cognitive-primary text-white font-semibold shadow-md shadow-cognitive-primary/20'
                        : 'text-cognitive-on-surface-variant hover:text-cognitive-on-surface hover:bg-cognitive-primary/5'
                    }`}
                  >
                    <span>{lang === 'hindi' ? 'हिंदी' : lang === 'marathi' ? 'मराठी' : 'English'}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>



        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2 rounded-xl text-cognitive-on-surface-variant hover:text-cognitive-on-surface hover:bg-cognitive-primary/5 transition-all"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse border border-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div
                className="absolute right-0 mt-2 w-80 z-40 rounded-2xl p-2 animate-fade-in-up glass-panel border border-cognitive-outline-variant/20 shadow-xl"
                style={{
                  background: 'var(--sidebar-bg)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                <div className="px-3 py-2 border-b border-cognitive-outline-variant/10 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800">{getTranslation('notifications')}</h4>
                  {unreadCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-600 rounded-full font-bold">
                      {unreadCount} {getTranslation('newNotifications')}
                    </span>
                  )}
                </div>
                
                <div className="py-1 max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => {
                    const isRead = readIds.includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                          navigate(notif.link);
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-colors cursor-pointer border-b border-cognitive-outline-variant/5 flex gap-2.5 items-start hover:bg-slate-900/5 ${
                          !isRead ? 'bg-indigo-500/[0.03]' : ''
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                          notif.type === 'interview' 
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : notif.type === 'aptitude'
                              ? 'bg-indigo-500/10 text-indigo-600'
                              : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {notif.type === 'interview' && <Award className="w-3.5 h-3.5" />}
                          {notif.type === 'aptitude' && <BookOpen className="w-3.5 h-3.5" />}
                          {notif.type !== 'interview' && notif.type !== 'aptitude' && <BellRing className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs truncate ${!isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {notif.title}
                            </p>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                            {notif.message}
                          </p>
                          <p className="text-[8px] text-slate-400 mt-1 font-medium">
                            {formatDate(notif.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-3 py-2 border-t border-cognitive-outline-variant/10 text-center">
                  <button 
                    onClick={() => {
                      markAllAsRead();
                      setShowNotifications(false);
                    }} 
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    {getTranslation('markAllAsRead')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all duration-200 ${
              showDropdown
                ? 'bg-cognitive-primary/10 border-cognitive-primary/25 shadow-sm'
                : 'bg-transparent border-transparent dark:border-white/5 hover:bg-cognitive-primary/5'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cognitive-primary to-cognitive-secondary flex items-center justify-center font-bold text-white text-xs animate-pulse-slow"
              style={{ boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left font-sans">
              <p className="text-xs font-semibold text-cognitive-on-surface leading-tight">{user?.name || 'Candidate'}</p>
              <p className="text-[10px] text-cognitive-on-surface-variant capitalize mt-0.5">{user?.role || 'Student'}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-cognitive-outline hidden sm:block transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
              <div
                className="absolute right-0 mt-2 w-56 z-40 rounded-2xl p-2 animate-fade-in-up glass-panel border border-cognitive-outline-variant/20 shadow-xl"
                style={{
                  background: 'var(--sidebar-bg)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                {/* User info */}
                <div className="px-3 py-2.5 rounded-xl mb-1 border-b border-cognitive-outline-variant/10 bg-cognitive-primary/5">
                  <p className="text-[10px] text-cognitive-on-surface-variant mb-0.5 font-sans">{getTranslation('signedInAs')}</p>
                  <p className="text-xs font-semibold text-cognitive-on-surface truncate font-sans">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-cognitive-on-surface-variant hover:text-cognitive-on-surface hover:bg-cognitive-primary/5 transition-colors font-sans"
                >
                  <User className="w-3.5 h-3.5 text-cognitive-outline" />
                  {getTranslation('editProfile')}
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-cognitive-on-surface-variant hover:text-cognitive-on-surface hover:bg-cognitive-primary/5 transition-colors font-sans"
                  >
                    <Shield className="w-3.5 h-3.5 text-cognitive-outline" />
                    {getTranslation('adminPanel')}
                  </Link>
                )}

                <div className="my-1 border-t border-cognitive-outline-variant/15" />

                <button
                  onClick={() => { setShowDropdown(false); logout(); navigate('/'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-350 hover:bg-rose-500/10 transition-colors text-left font-sans font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {getTranslation('signOut')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
