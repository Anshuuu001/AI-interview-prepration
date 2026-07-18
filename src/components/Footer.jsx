import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, ShieldCheck, Sparkles, Terminal, Award, Users, X, Activity, FileText, Lock } from 'lucide-react';

const Footer = () => {
  const [modalContent, setModalContent] = useState(null);

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  const renderModalContent = () => {
    if (!modalContent) return null;

    let title = '';
    let icon = null;
    let content = null;

    if (modalContent === 'security') {
      title = 'Security Policy';
      icon = <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      content = (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>At ElevateAI, the security of your personal data and interview recordings is our top priority. We employ industry-standard encryption protocols (TLS 1.2+) for all data in transit and AES-256 for data at rest.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Data Privacy:</strong> We strictly adhere to GDPR and CCPA guidelines. Your resume and interview data are never sold to third parties.</li>
            <li><strong>Anti-Cheat:</strong> Our proctoring system operates strictly within your browser, ensuring no intrusive system-level tracking software is installed on your device.</li>
            <li><strong>Vulnerability Management:</strong> We conduct regular security audits and penetration testing to ensure the integrity of our platform.</li>
          </ul>
        </div>
      );
    } else if (modalContent === 'terms') {
      title = 'Terms of Service';
      icon = <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      content = (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>By accessing and using ElevateAI, you agree to comply with the following terms:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Usage Policy:</strong> The platform is intended solely for personal career development and interview preparation.</li>
            <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li><strong>Fair Use:</strong> AI generation features (such as mock interviews and resume analysis) are subject to rate limiting to ensure fair access for all users.</li>
            <li><strong>Proctoring Agreement:</strong> By entering the Aptitude or Mock Interview Arena, you consent to our browser-based monitoring to ensure assessment integrity.</li>
          </ul>
        </div>
      );
    } else if (modalContent === 'status') {
      title = 'System Status';
      icon = <Activity className="w-5 h-5 text-emerald-500" />;
      content = (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold">All Systems Operational</span>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
              <span>Web Application</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Operational</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
              <span>AI Inference Engine</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Operational</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
              <span>Database Cluster</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Operational</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Proctoring Services</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Operational</span>
            </div>
          </div>
        </div>
      );
    }

    const modal = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer transition-opacity" 
          onClick={closeModal}
        />
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in-up z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                {icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            </div>
            <button 
              onClick={closeModal}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            {content}
          </div>
        </div>
      </div>
    );

    return createPortal(modal, document.body);
  };

  return (
    <footer className="mt-12 w-full relative z-10 transition-all duration-300">
      {/* Outer border & glassmorphic base */}
      <div 
        className="rounded-3xl p-6 sm:p-8 backdrop-blur-md border"
        style={{
          background: 'var(--card-bg, rgba(20, 16, 45, 0.4))',
          borderColor: 'var(--card-border, rgba(139, 92, 246, 0.15))',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/5 dark:border-slate-800/60">
          {/* Brand & Platform Bio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-primary-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                ElevateAI
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed max-w-sm">
              An intelligent, next-generation career accelerator and interview preparation portal. Powered by advanced artificial intelligence to refine and elevate candidate performance.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Anti-Cheat Shield Active
            </div>
          </div>

          {/* Feature details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary-400" />
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="text-primary-400 mt-0.5">•</span>
                <span><strong>AI Mock Room:</strong> Generates real-time custom questions and evaluates answers using precise semantic metrics.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary-400 mt-0.5">•</span>
                <span><strong>Code Execution Sandbox:</strong> Solve algorithmic code questions in a LeetCode-style compiler environment with real-time feedback.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary-400 mt-0.5">•</span>
                <span><strong>Aptitude quiz arena:</strong> Quantitative, Logical, and Verbal simulation tests built with anti-cheat watchdogs.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary-400 mt-0.5">•</span>
                <span><strong>Career advisor:</strong> Chatbot providing real-time cover letters and placement guidance.</span>
              </li>
            </ul>
          </div>

          {/* Engineering / Creators Team */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              Development Team
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start flex-col gap-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Frontend Engineering</span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                  <span>Ansh Bansod</span>
                </div>
              </div>
              <div className="flex items-start flex-col gap-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Backend Engineering</span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                  <span>Utkarsh Nandeshwar</span>
                </div>
              </div>
              <div className="flex items-start flex-col gap-1.5 pt-1 border-t border-slate-200/50 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Contributors</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400" />
                    <span>Dimpal Barewar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-pink-500 dark:bg-pink-400" />
                    <span>Akansha Rahangdale</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    <span>Pragati Seutkar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} ElevateAI. Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse mx-0.5" />
            <span>for placement success.</span>
          </div>
          <div className="flex items-center gap-4">
            <span onClick={() => openModal('security')} className="hover:text-slate-300 transition-colors cursor-pointer">Security Policy</span>
            <span onClick={() => openModal('terms')} className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span onClick={() => openModal('status')} className="hover:text-slate-300 transition-colors cursor-pointer">System Status</span>
          </div>
        </div>
      </div>
      {renderModalContent()}
    </footer>
  );
};

export default Footer;
