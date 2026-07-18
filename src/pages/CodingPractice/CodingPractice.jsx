import React from 'react';
import CodeSandbox from '../../components/CodeSandbox';
import AntiCheatPopup from '../../components/AntiCheatPopup';
import { Code2 } from 'lucide-react';

const CodingPractice = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up h-[calc(100vh-100px)] flex flex-col">
      <AntiCheatPopup />
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            Coding Practice Arena
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sharpen your DSA skills with AI-generated challenges and a smart LeetCode-style environment.
          </p>
        </div>
      </div>

      {/* Sandbox Container */}
      <div className="flex-1 min-h-[500px] relative">
        <CodeSandbox />
      </div>
    </div>
  );
};

export default CodingPractice;
