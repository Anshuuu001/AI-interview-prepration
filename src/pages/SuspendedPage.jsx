import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Clock, ShieldAlert } from 'lucide-react';
import Card from '../components/Card';

const SuspendedPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const blockUntilStr = localStorage.getItem('proctoring_block_until');
    if (!blockUntilStr) {
      navigate('/dashboard');
      return;
    }

    const blockUntil = parseInt(blockUntilStr, 10);
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((blockUntil - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        localStorage.removeItem('proctoring_block_until');
        navigate('/dashboard');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-10 px-6 border-rose-500/30">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <AlertOctagon className="w-10 h-10 text-rose-500" />
          <div className="absolute inset-0 border-2 border-rose-500/50 rounded-full animate-ping" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Account Temporarily Suspended</h1>
        
        <p className="text-slate-400 text-sm mb-6">
          Your access to the ElevateAI platform has been temporarily blocked due to repeated proctoring violations during your interview session.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-8 flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-lg font-mono font-bold text-amber-500">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm font-semibold text-slate-300">Remaining</span>
        </div>

        <div className="flex items-start gap-3 text-left bg-rose-500/10 p-4 rounded-xl">
          <ShieldAlert className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-rose-300">
            <strong>Security Notice:</strong> Attempting to bypass this restriction or continuing to trigger proctoring alerts after the ban expires may result in permanent account termination.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SuspendedPage;
