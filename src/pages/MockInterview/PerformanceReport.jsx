import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import {
  Award,
  BookOpen,
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const PerformanceReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const history = await interviewService.getPastInterviews();
        const found = (history || []).find(r => r.id === id);
        if (!found) {
          navigate('/interview');
          return;
        }
        setReport(found);
      } catch (err) {
        console.error("Failed to load interview report:", err);
        navigate('/interview');
      }
    };
    loadReport();
  }, [id, navigate]);

  if (!report) return <Loader message={getTranslation('loadingGradingDashboard')} />;

  const overallColor = getScoreColor(report.overallScore);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/interview')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {getTranslation('backToInterviews')}
        </button>

        <span className="text-xs text-slate-500">{getTranslation('evaluatedOn')} {new Date(report.date).toLocaleDateString()}</span>
      </div>

      {/* Main Title Banner */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{report.roleTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{getTranslation('performanceAppraisal')}</p>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            {getTranslation('backToDashboard')}
          </Button>
          <Button variant="primary" onClick={() => navigate('/interview')}>
            {getTranslation('takeAnotherPractice')}
          </Button>
        </div>
      </div>

      {/* Scores and radar cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${report.integrityScore !== undefined ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
        {/* Overall Score Card */}
        <Card className="text-center py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{getTranslation('overallPerformance')}</p>
          <div className={`text-4xl font-extrabold mb-2 ${overallColor.text}`}>{report.overallScore}%</div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${overallColor.bg} ${overallColor.border} ${overallColor.text}`}>
            {report.overallScore >= 80 ? getTranslation('distinguished') : report.overallScore >= 60 ? getTranslation('competent') : getTranslation('needsWork')}
          </span>
        </Card>

        {/* Technical Score Card */}
        <Card className="text-center py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{getTranslation('technicalRemark')}</p>
          <div className="text-3xl font-extrabold text-slate-100 mb-2">{report.technicalScore}%</div>
          <div className="w-full bg-slate-800 dark:bg-slate-850 h-2 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${report.technicalScore}%` }} />
          </div>
        </Card>

        {/* Behavioral Score Card */}
        <Card className="text-center py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{getTranslation('behavioralRemark')}</p>
          <div className="text-3xl font-extrabold text-slate-100 mb-2">{report.behavioralScore}%</div>
          <div className="w-full bg-slate-800 dark:bg-slate-850 h-2 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full" style={{ width: `${report.behavioralScore}%` }} />
          </div>
        </Card>

        {/* Camera Presence Card */}
        <Card className="text-center py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{getTranslation('cameraPresence')}</p>
          <div className="text-3xl font-extrabold text-slate-100 mb-2">{report.presenceScore ?? 100}%</div>
          <div className="w-full bg-slate-800 dark:bg-slate-850 h-2 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${report.presenceScore ?? 100}%` }} />
          </div>
        </Card>

        {/* AI Integrity Score Card */}
        {report.integrityScore !== undefined && (
          <Card className="text-center py-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Integrity Score</p>
            <div className={`text-3xl font-extrabold mb-2 ${report.integrityScore >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{report.integrityScore}%</div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              report.cheatingRisk === 'Low'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}>
              {report.cheatingRisk} Risk
            </span>
          </Card>
        )}
      </div>

      {/* General feedback summary card */}
      <Card title={getTranslation('overallAiEvaluationRemarks')} subtitle={getTranslation('summaryFeedbackSub')}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-600/10 border border-primary-500/20 rounded-xl text-primary-400 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            {report.feedback}
          </p>
        </div>
      </Card>

      {/* Interactive Transcripts Accordion */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
          {getTranslation('questionDiagnostics')} ({report.qaList.length})
        </h3>

        <div className="space-y-6">
          {report.qaList.map((qa, index) => {
            const qaScoreColor = getScoreColor(qa.score);
            return (
              <Card
                key={index}
                title={`${getTranslation('question')} ${index + 1}`}
                actions={
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${qaScoreColor.bg} ${qaScoreColor.border} ${qaScoreColor.text}`}>
                    {getTranslation('scoreLabel')}: {qa.score}%
                  </span>
                }
              >
                <div className="space-y-5 text-sm">
                  {/* Question */}
                  <div className="p-3.5 bg-slate-900/5 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-primary-400" />
                      {getTranslation('questionAsked')}
                    </p>
                    <p className="text-slate-100 font-semibold leading-relaxed">{qa.question}</p>
                    {qa.correctness && (
                      <div className="mt-3 flex gap-3 text-[10px] font-bold uppercase">
                         <span className="text-indigo-400">{getTranslation('accuracy')}: {qa.correctness}</span>
                      </div>
                    )}
                  </div>

                  {/* User Answer */}
                  <div className="p-3.5 bg-slate-900/5 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850/50 rounded-xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{getTranslation('yourResponse')}</p>
                    <p className="text-slate-300 italic whitespace-pre-line font-light leading-relaxed">
                      "{qa.userAnswer}"
                    </p>
                  </div>

                  {/* Technical Knowledge Assessor */}
                  {qa.technicalKnowledge && (
                    <div className="p-3.5 bg-primary-600/5 border border-primary-500/10 rounded-xl">
                      <p className="text-primary-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {getTranslation('technicalKnowledge')}
                      </p>
                      <p className="text-slate-300 leading-relaxed font-light">{qa.technicalKnowledge}</p>
                    </div>
                  )}

                  {/* Professional Communication Check */}
                  {qa.communication && (
                    <div className="p-3.5 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                      <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        {getTranslation('professionalCommunication')}
                      </p>
                      <p className="text-slate-300 leading-relaxed font-light text-sm">{qa.communication}</p>
                    </div>
                  )}

                  {/* Suggestion / Action Item */}
                  {qa.suggestions && (
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col gap-3">
                      <div>
                          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">{getTranslation('improvementSuggestion')}</p>
                          <p className="text-slate-300 leading-relaxed font-light text-sm">{qa.suggestions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
