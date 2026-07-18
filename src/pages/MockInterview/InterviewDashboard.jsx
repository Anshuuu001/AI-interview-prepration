import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Video, Calendar, Clock, Star, Play, Award, HelpCircle, ChevronRight, PlayCircle } from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const InterviewDashboard = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tpls = await interviewService.getTemplates();
        setTemplates(tpls || []);
      } catch (err) {
        console.error("Failed to load interview templates:", err);
      }
      try {
        const hist = await interviewService.getPastInterviews();
        setHistory(hist || []);
      } catch (err) {
        console.error("Failed to load interview history:", err);
      }
    };
    loadData();
  }, []);

  const handleStartInterview = (id) => {
    navigate(`/interview/room/${id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in-up relative z-10">
      {/* Ambient background blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-cognitive-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-cognitive-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cognitive-primary to-cognitive-secondary flex items-center justify-center shadow-lg shadow-cognitive-primary/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          {getTranslation('aiMockInterviewArena')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          {getTranslation('mockInterviewArenaSub')}
        </p>
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest">
          {getTranslation('selectInterviewProfile')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.filter(t => !t.isVideo).map((tpl) => (
            <Card
              key={tpl.id}
              hoverEffect
              title={tpl.title}
              subtitle={`${tpl.category} • ${tpl.difficulty}`}
              footer={
                <div className="flex items-center justify-between w-full translate-z-10">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-cognitive-primary/80" />
                    {tpl.questions.length} {getTranslation('questionsLabel')}
                  </span>
                  <button
                    onClick={() => handleStartInterview(tpl.id)}
                    className="px-4 py-2 bg-gradient-to-r from-cognitive-primary to-cognitive-secondary text-white text-xs font-bold rounded-xl shadow-lg shadow-cognitive-primary/25 hover:shadow-cognitive-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-1.5 group"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{getTranslation('startRound')}</span>
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              }
              className="glass-panel border border-slate-200/50 dark:border-white/5 relative overflow-hidden"
            >
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-300 leading-relaxed min-h-[50px] translate-z-20">
                {tpl.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* History section */}
      <div className="space-y-4">
        <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest">
          {getTranslation('pastEvaluationReports')}
        </h3>
        
        {history.filter(h => !templates.find(t => t.id === h.templateId)?.isVideo).length === 0 ? (
          <Card className="text-center py-12 border border-slate-850">
            <p className="text-sm text-slate-500">{getTranslation('noPastReports')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.filter(h => !templates.find(t => t.id === h.templateId)?.isVideo).map((rep) => {
              const scoreColor = getScoreColor(rep.overallScore);
              return (
                <Card
                  key={rep.id}
                  hoverEffect
                  className="glass-panel border border-slate-200/50 dark:border-white/5 border-l-4 dark:border-l-cognitive-primary border-l-cognitive-primary"
                  title={rep.roleTitle}
                  subtitle={new Date(rep.date).toLocaleDateString()}
                  actions={
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/interview/report/${rep.id}`)}
                      className="rounded-xl translate-z-10"
                    >
                      {getTranslation('inspectReport')}
                    </Button>
                  }
                >
                  <div className="flex items-center justify-between gap-4 mt-2 translate-z-20">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getTranslation('overall')}</p>
                        <p className={`text-xl font-extrabold mt-1 ${scoreColor.text}`}>{rep.overallScore}%</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200/20 dark:bg-slate-800" />
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getTranslation('technical')}</p>
                        <p className="text-sm font-extrabold text-slate-200 mt-1">{rep.technicalScore}%</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200/20 dark:bg-slate-800" />
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getTranslation('behavioral')}</p>
                        <p className="text-sm font-extrabold text-slate-200 mt-1">{rep.behavioralScore}%</p>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>{Math.round(rep.duration / 60)} {getTranslation('minutesLabel')}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDashboard;
