import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Video, Calendar, Clock, Star, Play, Award, HelpCircle, ChevronRight, PlayCircle, Camera } from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const VideoInterviewDashboard = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

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

  const videoTemplates = templates.filter(t => t.isVideo);

  // Set default selection when templates load
  useEffect(() => {
    if (videoTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(videoTemplates[0].id);
    }
  }, [videoTemplates, selectedTemplateId]);

  const handleStartInterview = (id) => {
    navigate(`/interview/room/${id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in-up relative z-10">
      {/* Ambient background blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Camera className="w-5 h-5 text-white" />
          </div>
          {getTranslation('aiVideoInterviewArena')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          {getTranslation('videoArenaDescription')}
        </p>
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {getTranslation('selectVideoProfile')}
        </h3>
        
        <Card className="liquid-glass-card p-6 sm:p-8 flex flex-col gap-8 relative overflow-hidden shadow-2xl border border-slate-200/50 dark:border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 w-full space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {getTranslation('configureYourSession')}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {videoTemplates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1.5 border material-interactive ${
                    selectedTemplateId === tpl.id 
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Video className={`w-4 h-4 ${selectedTemplateId === tpl.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="truncate w-full">{tpl.title}</span>
                </button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-800/50 mt-6 gap-4">
              <div className="text-xs text-slate-500 max-w-md">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{getTranslation('proctoringActiveLabel')}</span> {getTranslation('proctoringActiveDescription')}
              </div>
              <Button
                variant="primary"
                onClick={() => selectedTemplateId && handleStartInterview(selectedTemplateId)}
                icon={PlayCircle}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] material-interactive border border-white/20"
                disabled={!selectedTemplateId}
              >
                {getTranslation('launchInterview')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* History section */}
      <div className="space-y-4">
        <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest">
          {getTranslation('pastEvaluationReports')}
        </h3>
        
        {history.filter(h => templates.find(t => t.id === h.templateId)?.isVideo).length === 0 ? (
          <Card className="text-center py-12 border border-slate-850">
            <p className="text-sm text-slate-500">{getTranslation('noPastVideoReports')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.filter(h => templates.find(t => t.id === h.templateId)?.isVideo).map((rep) => {
              const scoreColor = getScoreColor(rep.overallScore);
              return (
                <Card
                  key={rep.id}
                  hoverEffect
                  className="glass-panel border border-slate-200/50 dark:border-white/5 border-l-4 dark:border-l-emerald-500 border-l-emerald-500"
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
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getTranslation('technicalLabel')}</p>
                        <p className="text-sm font-extrabold text-slate-200 mt-1">{rep.technicalScore}%</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200/20 dark:bg-slate-800" />
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getTranslation('behavioral')}</p>
                        <p className="text-sm font-extrabold text-slate-200 mt-1">{rep.behavioralScore}%</p>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-400" />
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

export default VideoInterviewDashboard;
