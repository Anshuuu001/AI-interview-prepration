import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Code2, Users, Sparkles, MessageSquare, Zap, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      
      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">ElevateAI</span>
        </div>
        
        <div className="flex items-center gap-4">
          
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-8 animate-fade-in-up border border-indigo-100 dark:border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Future of Hiring is Here</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Master your next interview with <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">Cognitive AI.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          ElevateAI provides hyper-realistic mock interviews, real-time code execution, and deep performance analytics to get you hired faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1"
          >
            Start Practicing Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/20 dark:shadow-none hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Mock Interviews</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Practice behavioral and technical rounds with an AI interviewer that grades you using the STAR method.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/20 dark:shadow-none hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6">
              <Code2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Code Execution Sandbox</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Solve algorithmic challenges in a LeetCode-style environment with instant AI compilation and feedback.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/20 dark:shadow-none hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Career Advisor</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Consult with our 24/7 AI-guided career counselor to get feedback on role expectations and prep tips.
            </p>
          </div>

        </div>
      </main>

      {/* How it Works Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-4 border border-emerald-100 dark:border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">How ElevateAI Works</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A seamless experience designed to accelerate your career growth and land you your dream job.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 shadow-xl shadow-indigo-500/10">1</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Define Your Path</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Use our AI career advisory tools to select target roles and plan optimization strategies.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 shadow-xl shadow-indigo-500/10">2</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Practice Interviews</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Take hyper-realistic AI mock interviews tailored specifically to your target role.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 shadow-xl shadow-indigo-500/10">3</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Get Hired Faster</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Use our actionable analytics and feedback reports to ace the real interview.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 mb-10">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-10 md:p-16 text-center shadow-2xl shadow-indigo-600/20 border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Elevate Your Career?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of candidates who have landed their dream jobs using our Cognitive AI interview platform.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-full bg-white text-indigo-600 font-bold text-lg shadow-xl hover:scale-105 transition-transform"
            >
              Create Your Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative z-10 w-full border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">ElevateAI</span>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ElevateAI. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
