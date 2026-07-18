import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, BookOpen, Award, Sparkles, Clock } from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const TestResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const history = await interviewService.getTestResults();
        const found = (history || []).find(r => r.id === id);
        if (!found) {
          navigate('/aptitude');
          return;
        }
        setResult(found);
      } catch (err) {
        console.error("Failed to load test result:", err);
        navigate('/aptitude');
      }
    };
    loadResult();
  }, [id, navigate]);

  if (!result) return <Loader message={getTranslation('compilingMetrics')} />;

  const accuracyColor = getScoreColor(result.percentage);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header navigators */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/aptitude')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {getTranslation('backToAssessmentHub')}
        </button>

        <span className="text-xs text-slate-500 font-medium">{getTranslation('completedOn')} {new Date(result.date).toLocaleDateString()}</span>
      </div>

      {/* Main Title Banner */}
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">{getTranslation('testReportCard')}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {getTranslation('categoryLabel')} {result.category === 'All' ? getTranslation('allLabel') : result.category}
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Button variant="secondary" onClick={() => navigate('/dashboard')} className="rounded-xl">
            {getTranslation('dashboard')}
          </Button>
          <Button variant="primary" onClick={() => navigate('/aptitude')} className="rounded-xl shadow-md shadow-primary-600/10">
            {getTranslation('retakePractice')}
          </Button>
        </div>
      </div>

      {/* Results Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accuracy Index */}
        <Card hoverEffect className="text-center py-6 border border-slate-200/50 dark:border-slate-800/80">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{getTranslation('accuracyRating')}</p>
          <div className={`text-4xl font-black mb-2 translate-z-30 ${accuracyColor.text}`}>{result.percentage}%</div>
          <span className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black border translate-z-10 ${accuracyColor.bg} ${accuracyColor.border} ${accuracyColor.text} shadow-sm`}>
            {result.correctAnswers} {getTranslation('ofLabel')} {result.totalQuestions} {getTranslation('correctLabel')}
          </span>
        </Card>

        {/* Time Taken */}
        <Card hoverEffect className="text-center py-6 border border-slate-200/50 dark:border-slate-800/80">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{getTranslation('timeConsumed')}</p>
          <div className="text-3xl font-black text-slate-100 mb-2 translate-z-30 flex items-center justify-center gap-1.5">
            <Clock className="w-6 h-6 text-indigo-400" />
            {Math.floor(result.secondsSpent / 60)}m {result.secondsSpent % 60}s
          </div>
          <p className="text-xs text-slate-500 translate-z-10">{getTranslation('avgLabel')} {Math.round(result.secondsSpent / result.totalQuestions)}{getTranslation('perQuestionLabel')}</p>
        </Card>

        {/* Competency grade */}
        <Card hoverEffect className="text-center py-6 border border-slate-200/50 dark:border-slate-800/80">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{getTranslation('ratingGrade')}</p>
          <div className="text-3xl font-black text-indigo-400 mb-2 translate-z-30 flex items-center justify-center gap-1.5">
            <Award className="w-7 h-7 text-indigo-400" />
            {result.percentage >= 80 ? 'A+' : result.percentage >= 60 ? 'B' : 'C-'}
          </div>
          <p className="text-xs text-slate-500 translate-z-10 capitalize font-semibold">{result.percentage >= 60 ? getTranslation('qualifiedGrade') : getTranslation('requiresReviewGrade')}</p>
        </Card>
      </div>

      {/* Questions analysis listing */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
          {getTranslation('reviewQuestionsExplanations')} ({result.totalQuestions})
        </h3>

        <div className="space-y-6">
          {(result.details || []).map((q, index) => {
            const hasSkipped = q.selectedOption === -1;
            return (
              <Card
                key={index}
                title={`${getTranslation('questionLabel')} ${index + 1}`}
                actions={
                  hasSkipped ? (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-900/5 dark:bg-slate-850 text-slate-500 dark:text-slate-400">
                      {getTranslation('skippedLabel')}
                    </span>
                  ) : q.isCorrect ? (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {getTranslation('correctLabel')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black border border-rose-500/20 bg-rose-500/10 text-rose-400 flex items-center gap-1 shadow-sm">
                      <XCircle className="w-3.5 h-3.5" /> {getTranslation('incorrectLabel')}
                    </span>
                  )
                }
                className="border border-slate-200/50 dark:border-slate-800/80"
              >
                <div className="space-y-4 text-sm">
                  {/* Question Asked */}
                  <div className="p-3.5 bg-slate-900/5 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-slate-100 font-semibold leading-relaxed">{q.question}</p>
                  </div>

                  {/* Answers chosen comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-900/10">
                      <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">{getTranslation('yourSelection')}</p>
                      <p className={`font-semibold ${q.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {hasSkipped ? getTranslation('noAnswerLabel') : q.options[q.selectedOption]}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-900/10">
                      <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">{getTranslation('correctAnswerLabel')}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{q.options[q.correctOption]}</p>
                    </div>
                  </div>

                  {/* Explanations text block */}
                  <div className="p-3.5 bg-indigo-600/5 border border-indigo-500/10 rounded-xl">
                    <p className="text-indigo-500 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> {getTranslation('correctExplanationLabel')}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-xs">{q.explanation}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestResult;
