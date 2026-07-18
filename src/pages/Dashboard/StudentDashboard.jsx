import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
  TrendingUp,
  FileText,
  Video,
  Award,
  BookOpen,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import Footer from '../../components/Footer';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState([]);
  const [metrics, setMetrics] = useState({
    readiness: 75,
    interviewCount: 0,
    avgAptitude: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load data from backend services
        const interviewHistory = await interviewService.getPastInterviews() || [];
        const aptitudeHistory = await interviewService.getTestResults() || [];

        setInterviews(interviewHistory);

        // Compute average scores
        const avgInterview = interviewHistory.length > 0
          ? Math.round(interviewHistory.reduce((acc, curr) => acc + curr.overallScore, 0) / interviewHistory.length)
          : 70;
        
        const avgApt = aptitudeHistory.length > 0
          ? Math.round(aptitudeHistory.reduce((acc, curr) => acc + curr.percentage, 0) / aptitudeHistory.length)
          : 0;

        // Compute readiness score (60% interview, 40% aptitude)
        const computedReadiness = Math.round((avgInterview * 0.6) + ((avgApt || 60) * 0.4));

        setMetrics({
          readiness: computedReadiness || 72,
          interviewCount: interviewHistory.length,
          avgAptitude: avgApt
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadDashboardData();
  }, []);

  const readinessColor = getScoreColor(metrics.readiness);
  const aptitudeColor = getScoreColor(metrics.avgAptitude || 60);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ── 3D Aurora Welcome Banner ── */}
      <div className="relative rounded-3xl overflow-hidden p-7 sm:p-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 liquid-glass-card"
        style={{
          background: 'var(--banner-bg)',
          border: '1px solid var(--banner-border)',
          boxShadow: 'var(--card-shadow)',
        }}>
        {/* Animated aurora orbs inside banner - Liquid morphing */}
        <div className="absolute -top-20 -right-20 w-80 h-80 animate-morph animate-float-slow pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-10 left-1/4 w-52 h-52 animate-morph-slow animate-float-slower pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(35px)' }} />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 animate-morph-slower pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', filter: 'blur(25px)' }} />

        <div className="relative z-10 space-y-4 max-w-2xl">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#c4b5fd',
              boxShadow: '0 0 20px rgba(124,58,237,0.15)',
            }}>
            <Zap className="w-3 h-3" fill="currentColor" />
            {getTranslation('aiPlacementReadinessEngineActive')}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span style={{ color: 'var(--banner-text)' }}>{getTranslation('elevateYourCareer')},{' '}</span>
            <span className="aurora-text">{user?.name || 'Candidate'}</span>
            <span style={{ color: 'var(--banner-text)' }}> 🚀</span>
          </h2>

          <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'var(--banner-subtext)' }}>
            {getTranslation('dashboardBannerSubtext')}
          </p>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <button
            onClick={() => navigate('/interview')}
            className="ai-button group flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-sm transition-all duration-300"
          >
            <Video className="w-4.5 h-4.5" />
            {getTranslation('startMockInterview')}
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ── Neon Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Readiness Index */}
        <div className={`metric-card liquid-glass-card glow-readiness p-5`}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{getTranslation('readinessRating')}</p>
              <div className="metric-icon p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h3 className="text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400" style={{ textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
              {metrics.readiness}<span className="text-2xl text-emerald-700/70 dark:text-emerald-500/70">%</span>
            </h3>
            <div className="mt-3 neon-progress h-1.5">
              <div className="neon-progress-bar" style={{ width: `${metrics.readiness}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {getTranslation('aiWeightedRecruitmentRating')}
            </p>
          </div>
        </div>

        {/* Interviews Done */}
        <div className={`metric-card liquid-glass-card glow-interviews p-5`}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{getTranslation('interviewsDone')}</p>
              <div className="metric-icon p-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h3 className="text-4xl font-black tracking-tight text-indigo-600 dark:text-indigo-400" style={{ textShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              {metrics.interviewCount}
            </h3>
            <p className="mt-5 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {getTranslation('aiPanelistSessionsCompleted')}
            </p>
          </div>
        </div>

        {/* Aptitude Score */}
        <div className={`metric-card liquid-glass-card glow-aptitude p-5`}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{getTranslation('aptitudeScore')}</p>
              <div className="metric-icon p-2.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h3 className={`text-4xl font-black tracking-tight ${aptitudeColor.text}`} style={{ textShadow: metrics.avgAptitude > 0 ? '0 0 20px rgba(245,158,11,0.4)' : 'none' }}>
              {metrics.avgAptitude > 0 ? <>{metrics.avgAptitude}<span className="text-2xl opacity-60">%</span></> : 'N/A'}
            </h3>
            <p className="mt-5 text-[11px]">
              {metrics.avgAptitude > 0
                ? <Link to="/aptitude" className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold"><ArrowRight className="w-3 h-3" /> {getTranslation('viewReport')}</Link>
                : <span className="text-slate-600">{getTranslation('noQuizTaken')}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Actions, Charts, History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: History logs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Past interviews section */}
          <Card
            title={getTranslation('recentMockInterviews')}
            subtitle={getTranslation('recentMockInterviewsSubtitle')}
            actions={
              <button
                onClick={() => navigate('/interview')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/5 dark:bg-slate-800 hover:bg-slate-900/10 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-200 transition-colors"
              >
                {getTranslation('seeAll')}
              </button>
            }
            className="border border-slate-200/50 dark:border-slate-800/80"
          >
            {interviews.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                {getTranslation('noInterviewsCompleted')}
              </div>
            ) : (
              <div className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
                {interviews.slice(0, 3).map((item) => {
                  const scoreInfo = getScoreColor(item.overallScore);
                  return (
                    <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{item.roleTitle}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {new Date(item.date).toLocaleDateString()} • {getTranslation('duration')}: {Math.round(item.duration / 60)} mins
                        </p>
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${scoreInfo.bg} ${scoreInfo.border} ${scoreInfo.text}`}>
                          {getTranslation('score')}: {item.overallScore}%
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/interview/report/${item.id}`)}
                          className="rounded-xl"
                        >
                          {getTranslation('viewReport')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Quick navigation shortcuts & AI career recommendations */}
        <div className="space-y-8">
          <Card
            title={getTranslation('aiCareerCopilot')}
            subtitle={getTranslation('aiCareerCopilotSubtitle')}
            className="border border-slate-200/50 dark:border-slate-800/80"
          >
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary-600/10 to-indigo-600/10 border border-primary-500/20 text-xs text-slate-500 dark:text-slate-300 leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-xl" />
                <span className="font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5 text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  {getTranslation('aiRecommendation')}
                </span>
                {getTranslation('aiRecommendationText')}
              </div>

              <div className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{getTranslation('practiceShortcuts')}</p>
                
                <Link
                  to="/chat"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <MessageSquare className="w-4.5 h-4.5 text-emerald-500" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-100 font-semibold">{getTranslation('aiCareerAdvisor247')}</span>
                  </div>
                  <ArrowRight className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/aptitude"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl">
                      <BookOpen className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-100 font-semibold">{getTranslation('aptitudePrepArena')}</span>
                  </div>
                  <ArrowRight className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Card>

          <Card
            title={getTranslation('profileDetails')}
            subtitle={getTranslation('profileDetailsSubtitle')}
            className="border border-slate-200/50 dark:border-slate-800/80"
          >
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-400">
              <div className="flex justify-between py-2 border-b border-slate-200/40 dark:border-slate-800/50">
                <span className="font-semibold text-slate-700 dark:text-slate-400">{getTranslation('accountStatus')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {getTranslation('activePremium')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/40 dark:border-slate-800/50">
                <span className="font-semibold text-slate-700 dark:text-slate-400">{getTranslation('targetRole')}</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{user?.title || 'Full Stack Engineer'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-700 dark:text-slate-400">{getTranslation('skillsDetected')}</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[160px]" title={user?.skills && user.skills.length > 0 ? user.skills.join(', ') : 'React, JS, HTML'}>
                  {user?.skills && user.skills.length > 0 ? user.skills.join(', ') : 'React, JS, HTML'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="pt-8">
        <Footer />
      </div>
    </div>
  );
};

export default StudentDashboard;
