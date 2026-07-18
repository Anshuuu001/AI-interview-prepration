import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Download
} from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Footer from '../../components/Footer';
import { getTranslation } from '../../utils/translations';
import interviewService from '../../services/interviewService';

const Analytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [trendTab, setTrendTab] = useState('week'); // 'week' or 'month'
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    technical: 85,
    softSkills: 72,
    logic: 92,
    readiness: 75
  });

  const [weeklyTrend, setWeeklyTrend] = useState([
    { label: 'MON', score: 35 },
    { label: 'TUE', score: 45 },
    { label: 'WED', score: 40 },
    { label: 'THU', score: 62 },
    { label: 'FRI', score: 55 },
    { label: 'SAT', score: 76 },
    { label: 'SUN', score: 70 },
    { label: 'TODAY', score: 85 }
  ]);

  const [monthlyTrend, setMonthlyTrend] = useState([
    { label: 'JAN', score: 45 },
    { label: 'FEB', score: 50 },
    { label: 'MAR', score: 48 },
    { label: 'APR', score: 65 },
    { label: 'MAY', score: 58 },
    { label: 'JUN', score: 72 },
    { label: 'JUL', score: 80 },
    { label: 'TODAY', score: 85 }
  ]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const interviewHistory = await interviewService.getPastInterviews() || [];
        const aptitudeHistory = await interviewService.getTestResults() || [];

        // 1. Calculate Technical Skills average from interview history
        const techScores = interviewHistory.map(i => i.technicalScore).filter(Boolean);
        const avgTech = techScores.length > 0
          ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length)
          : 85;

        // 2. Calculate Soft Skills average from interview history
        const behavioralScores = interviewHistory.map(i => i.behavioralScore).filter(Boolean);
        const avgBehavioral = behavioralScores.length > 0
          ? Math.round(behavioralScores.reduce((a, b) => a + b, 0) / behavioralScores.length)
          : 72;

        // 3. Calculate Logic average from aptitude test results
        const aptScores = aptitudeHistory.map(a => a.percentage).filter(s => s !== undefined);
        const avgApt = aptScores.length > 0
          ? Math.round(aptScores.reduce((a, b) => a + b, 0) / aptScores.length)
          : 92;

        // 4. Calculate overall Readiness score (weight: 60% interview, 40% aptitude)
        const avgInterview = interviewHistory.length > 0
          ? Math.round(interviewHistory.reduce((acc, curr) => acc + curr.overallScore, 0) / interviewHistory.length)
          : 70;
        const computedReadiness = Math.round((avgInterview * 0.6) + ((avgApt || 60) * 0.4)) || 75;

        setMetrics({
          technical: avgTech,
          softSkills: avgBehavioral,
          logic: avgApt,
          readiness: computedReadiness
        });

        // 5. Generate Weekly trends from the last 8 interviews or fallbacks
        const mockWeeklyBase = [
          { label: 'MON', score: 35 },
          { label: 'TUE', score: 45 },
          { label: 'WED', score: 40 },
          { label: 'THU', score: 62 },
          { label: 'FRI', score: 55 },
          { label: 'SAT', score: 76 },
          { label: 'SUN', score: 70 },
          { label: 'TODAY', score: computedReadiness }
        ];

        const finalWeekly = [...mockWeeklyBase];
        if (interviewHistory.length > 0) {
          const sortedInterviews = [...interviewHistory].reverse().slice(-7);
          sortedInterviews.forEach((item, index) => {
            const labelIndex = mockWeeklyBase.length - 1 - sortedInterviews.length + index;
            if (labelIndex >= 0 && labelIndex < finalWeekly.length - 1) {
              const dateObj = new Date(item.date);
              const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              const dayName = days[dateObj.getDay()];
              const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
              finalWeekly[labelIndex] = {
                label: `${dayName} ${dateStr}`,
                score: item.overallScore
              };
            }
          });
        }
        finalWeekly[finalWeekly.length - 1] = { label: 'TODAY', score: computedReadiness };
        setWeeklyTrend(finalWeekly);

        // 6. Generate Monthly trends from historical monthly averages where applicable
        const mockMonthlyBase = [
          { label: 'JAN', score: 45 },
          { label: 'FEB', score: 50 },
          { label: 'MAR', score: 48 },
          { label: 'APR', score: 65 },
          { label: 'MAY', score: 58 },
          { label: 'JUN', score: 72 },
          { label: 'JUL', score: 80 },
          { label: 'TODAY', score: computedReadiness }
        ];
        setMonthlyTrend(mockMonthlyBase);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load analytics metrics", err);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const chartData = trendTab === 'week' ? weeklyTrend : monthlyTrend;

  // Helper to space SVG points responsive and map y values
  const getSVGPoints = (data) => {
    if (!data || data.length === 0) return [];
    const count = data.length;
    return data.map((d, index) => {
      const x = count > 1 ? 50 + (index * (700 / (count - 1))) : 400;
      const y = 180 - (d.score / 100) * 140; // Scale score strictly between y = 40 and y = 180
      return { ...d, x, y };
    });
  };

  const points = getSVGPoints(chartData);
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z` : '';

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ── Header Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
            <span className="text-slate-100 font-display">{getTranslation('performanceDashboard')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {getTranslation('detailedReadinessBreakdown')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Dropdown */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-200 transition-colors"
            onClick={() => setTimeRange(timeRange === 'Last 30 Days' ? 'Last 7 Days' : 'Last 30 Days')}
          >
            <Calendar className="w-3.5 h-3.5 text-primary-400" />
            {timeRange === 'Last 30 Days' ? getTranslation('timeframeLast30Days') : getTranslation('timeframeLast7Days')}
          </button>

          {/* Export PDF Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => window.print()}
            className="rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {getTranslation('exportPdf')}
          </Button>
        </div>
      </div>

      {/* ── Top Grid: Skill Distribution & AI Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Card 1: Skill Distribution (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <Card
            title={getTranslation('skillDistribution')}
            subtitle={getTranslation('comparativeAnalysis')}
            actions={
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-350">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>{getTranslation('current')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80" />
                  <span>{getTranslation('benchmark')}</span>
                </div>
              </div>
            }
            className="h-full border border-slate-200/50 dark:border-slate-800/80"
          >
            {/* Skill Distribution Columns */}
            <div className="flex justify-around items-end h-64 pt-8 pb-4">
              
              {/* Technical Skill Column */}
              <div className="flex flex-col items-center gap-3 group w-28">
                <div className="flex justify-center gap-1.5 text-xs font-extrabold">
                  <span className="text-indigo-400">{metrics.technical}%</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">75%</span>
                </div>
                <div className="flex items-end gap-2.5 h-40 pb-1">
                  {/* Current Bar */}
                  <div className="w-4 bg-slate-900/10 dark:bg-slate-950/40 rounded-t-full h-full relative flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary-600 to-indigo-400 rounded-t-full transition-all duration-1000 origin-bottom"
                      style={{ height: `${metrics.technical}%` }}
                    />
                  </div>
                  {/* Benchmark Bar */}
                  <div className="w-4 bg-slate-900/10 dark:bg-slate-950/40 rounded-t-full h-full relative flex items-end">
                    <div
                      className="w-full bg-slate-700/60 rounded-t-full transition-all duration-1000 origin-bottom"
                      style={{ height: '75%' }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 text-center tracking-wider leading-tight">
                  {getTranslation('technical')}
                </span>
              </div>

              {/* Soft Skills Column */}
              <div className="flex flex-col items-center gap-3 group w-28">
                <div className="flex justify-center gap-1.5 text-xs font-extrabold">
                  <span className="text-indigo-400">{metrics.softSkills}%</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">70%</span>
                </div>
                <div className="flex items-end gap-2.5 h-40 pb-1">
                  {/* Current Bar */}
                  <div className="w-4 bg-slate-900/10 dark:bg-slate-950/40 rounded-t-full h-full relative flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary-600 to-indigo-400 rounded-t-full transition-all duration-1000 origin-bottom"
                      style={{ height: `${metrics.softSkills}%` }}
                    />
                  </div>
                  {/* Benchmark Bar */}
                  <div className="w-4 bg-slate-900/10 dark:bg-slate-950/40 rounded-t-full h-full relative flex items-end">
                    <div
                      className="w-full bg-slate-700/60 rounded-t-full transition-all duration-1000 origin-bottom"
                      style={{ height: '70%' }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 text-center tracking-wider leading-tight">
                  {getTranslation('softSkills')}
                </span>
              </div>

              {/* Logic Column */}
              <div className="flex flex-col items-center gap-3 group w-28">
                <div className="flex justify-center gap-1.5 text-xs font-extrabold">
                  <span className="text-indigo-400">{metrics.logic}%</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">80%</span>
                </div>
                <div className="flex items-end gap-2.5 h-40 pb-1">
                  {/* Current Bar */}
                  <div className="w-4 bg-slate-900/10 dark:bg-slate-950/40 rounded-t-full h-full relative flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary-600 to-indigo-400 rounded-t-full transition-all duration-1000 origin-bottom"
                      style={{ height: `${metrics.logic}%` }}
                    />
                  </div>
                  {/* Benchmark Bar */}
                  <div className="w-4 bg-slate-900/10 dark:bg-slate-950/40 rounded-t-full h-full relative flex items-end">
                    <div
                      className="w-full bg-slate-700/60 rounded-t-full transition-all duration-1000 origin-bottom"
                      style={{ height: '80%' }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 text-center tracking-wider leading-tight">
                  {getTranslation('logic')}
                </span>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Side: AI Insights & Global Rank */}
        <div className="space-y-8 flex flex-col justify-between">
          
          {/* Card 2: AI Insights */}
          <Card
            title={getTranslation('aiInsights')}
            className="border border-slate-200/50 dark:border-slate-800/80 bg-gradient-to-tr from-primary-600/10 to-indigo-600/10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary-400">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs uppercase tracking-wider">{getTranslation('automatedCoaching')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {getTranslation('coachingInsightText')}
              </p>
              
              {/* Next Milestone */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>{getTranslation('nextMilestone')}</span>
                  <span className="text-indigo-400">88% {getTranslation('milestoneMatch')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900/40 dark:bg-slate-950/45 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-400 rounded-full" style={{ width: `${metrics.readiness}%` }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Global Rank */}
          <Card
            title={getTranslation('globalRank')}
            className="border border-slate-200/50 dark:border-slate-800/80 relative overflow-hidden"
          >
            {/* Soft decorative badge background */}
            <div className="absolute top-2 right-2 w-20 h-20 bg-primary-500/5 rounded-full blur-lg pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight text-slate-100">
                  #{Math.max(1, Math.min(50000, Math.round((100 - metrics.readiness) * 15.5 + 42)))} <span className="text-sm font-semibold text-slate-500">/ 50k+</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  {getTranslation('globalRankImprovement')}
                </p>
              </div>
              
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* ── Middle Section: Performance Trends ── */}
      <Card
        title={getTranslation('performanceTrends')}
        subtitle={trendTab === 'week' ? getTranslation('performanceTrendsSub') : 'Monthly mock session progress visualization'}
        actions={
          <div className="flex bg-slate-900/10 dark:bg-slate-950/40 rounded-xl p-0.5 border border-slate-200/40 dark:border-slate-800/60">
            <button
              onClick={() => setTrendTab('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                trendTab === 'week'
                  ? 'bg-slate-900/60 dark:bg-slate-950/60 text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {getTranslation('week')}
            </button>
            <button
              onClick={() => setTrendTab('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                trendTab === 'month'
                  ? 'bg-slate-900/60 dark:bg-slate-950/60 text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {getTranslation('month')}
            </button>
          </div>
        }
        className="border border-slate-200/50 dark:border-slate-800/80"
      >
        {/* SVG Line Chart (Responsive Layout) */}
        <div className="relative w-full">
          <div className="w-full h-60 relative">
            
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-500 w-full" />
              <div className="border-b border-slate-500 w-full" />
              <div className="border-b border-slate-500 w-full" />
              <div className="border-b border-slate-500 w-full" />
              <div className="border-b border-slate-500 w-full" />
            </div>

            <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible relative z-10">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Area path */}
              {areaPath && <path d={areaPath} fill="url(#area-grad)" />}

              {/* Line path */}
              {linePath && <path d={linePath} fill="none" stroke="url(#line-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

              {/* Glowing Dots */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  {/* Outer transparent hit-zone */}
                  <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                  
                  {/* Pulse Ring for today/latest */}
                  {p.label === 'TODAY' && (
                    <circle cx={p.x} cy={p.y} r="10" fill="none" stroke="#06b6d4" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                  )}

                  {/* Outer ring */}
                  <circle cx={p.x} cy={p.y} r="5" fill="#05070f" stroke={p.label === 'TODAY' ? '#06b6d4' : '#4f46e5'} strokeWidth="2.5" />
                  
                  {/* Tooltip on hover */}
                  <rect x={p.x - 22} y={p.y - 30} width="44" height="20" rx="6" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <text x={p.x} y={p.y - 16} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {p.score}%
                  </text>
                </g>
              ))}
            </svg>

            {/* X-Axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-[10px] font-bold text-slate-500">
              {points.map((p, idx) => (
                <span key={idx} style={{ width: '40px', textAlign: 'center' }}>{p.label}</span>
              ))}
            </div>

          </div>
        </div>
      </Card>

      {/* ── Bottom Section: Practice Navigation Shortcuts ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Shortcut 1 */}
        <div
          onClick={() => navigate('/interview')}
          className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-100 text-sm">{getTranslation('dailyChallenge')}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{getTranslation('systemDesignPractice')}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
        </div>

        {/* Shortcut 2 */}
        <div
          onClick={() => navigate('/interview')}
          className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-100 text-sm">{getTranslation('pitchAnalysis')}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{getTranslation('analyzeToneClarity')}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
        </div>

        {/* Shortcut 3 */}
        <div
          onClick={() => navigate('/chat')}
          className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-100 text-sm">{getTranslation('recentFeedback')}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{getTranslation('reviewMentorNotes')}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
        </div>

      </div>

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
};

export default Analytics;
