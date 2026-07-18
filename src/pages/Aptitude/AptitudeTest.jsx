import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import { useNotifications } from '../../hooks/useNotifications';
import Card from '../../components/Card';
import Button from '../../components/Button';
import AntiCheatOverlay from '../../components/AntiCheatOverlay';
import useAntiCheat from '../../hooks/useAntiCheat';
import { ClipboardList, Clock, Check, ArrowLeft, ArrowRight, RefreshCw, BookOpen, HelpCircle } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

const AptitudeTest = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Test execution state
  const [testActive, setTestActive] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [testQuestions, setTestQuestions] = useState([]);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const timerRef = useRef(null);

  // Anti-cheat: active only during live test
  const { warningCount, showWarning, warningMessage, dismiss } = useAntiCheat({
    active: testActive,
    onViolation: (count) => {
      // After 3 violations during aptitude test, auto-submit
      if (count >= 3 && testActive) {
        submitAnswers();
      }
    },
  });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const list = await interviewService.getAptitudeQuestions();
        const safeList = list || [];
        setQuestions(safeList);
        // Extract unique categories
        const cats = ['All', ...new Set(safeList.map(q => q.category))];
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch aptitude questions:", err);
      }
    };
    loadQuestions();
  }, []);

  const handleStartTest = () => {
    // Filter questions
    const filtered = selectedCategory === 'All'
      ? questions
      : questions.filter(q => q.category === selectedCategory);
    
    // Pick max 5 questions for simplicity and speed
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
    setTestQuestions(selected);
    setAnswers({});
    setActiveIdx(0);
    setTimeRemaining(300);
    setSecondsSpent(0);
    setTestActive(true);

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev <= 1 ? 0 : prev - 1));
      setSecondsSpent(prev => prev + 1);
    }, 1000);
  };

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    submitAnswers();
  };

  const handleSelectOption = (idx) => {
    const qId = testQuestions[activeIdx].id;
    setAnswers({ ...answers, [qId]: idx });
  };

  const handleNext = () => {
    if (activeIdx < testQuestions.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  const submitAnswers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let correctCount = 0;
    const details = testQuestions.map(q => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedOption: selected !== undefined ? selected : -1,
        correctOption: q.correctAnswer,
        explanation: q.explanation,
        isCorrect
      };
    });

    const percentage = Math.round((correctCount / testQuestions.length) * 100);

    const testResult = {
      id: `result-${Date.now()}`,
      category: selectedCategory,
      totalQuestions: testQuestions.length,
      correctAnswers: correctCount,
      percentage,
      secondsSpent,
      date: new Date().toISOString(),
      details
    };

    interviewService.saveTestResult(testResult);
    
    // Trigger a live notification
    addNotification({
      title: 'Aptitude Test Graded',
      message: `You scored ${percentage}% in your ${selectedCategory === 'All' ? 'All Subjects' : selectedCategory} aptitude quiz.`,
      type: 'aptitude',
      link: `/aptitude/result/${testResult.id}`
    });

    setTestActive(false);
    navigate(`/aptitude/result/${testResult.id}`);
  };

  useEffect(() => {
    if (testActive && timeRemaining === 0) {
      handleAutoSubmit();
    }
  }, [timeRemaining, testActive]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (testActive) {
    const currentQ = testQuestions[activeIdx];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up" style={{ userSelect: 'none' }}>
        {/* Anti-cheat overlay */}
        <AntiCheatOverlay
          show={showWarning}
          message={warningMessage}
          warningCount={warningCount}
          onDismiss={dismiss}
        />
        {/* Test top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
              {selectedCategory === 'All' ? getTranslation('allLabel') : selectedCategory} {getTranslation('aptitudeQuiz')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {getTranslation('questionLabel')} {activeIdx + 1} {getTranslation('ofLabel')} {testQuestions.length} ({answeredCount} {getTranslation('answeredLabel')})
            </p>
          </div>

          {/* Glowing Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border transition-all shadow-md ${
            timeRemaining < 60
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-slate-900/5 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-200'
          }`}>
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{getTranslation('timeLeft')}: {formatDuration(timeRemaining)}</span>
          </div>
        </div>

        {/* Question Panel */}
        <Card className="min-h-[300px] flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/80">
          <div className="space-y-6">
            <h4 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = answers[currentQ.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(oIdx)}
                    className={`text-left w-full px-5 py-3.5 rounded-2xl border text-sm transition-all flex items-center justify-between choice-3d-card ${
                      isSelected
                        ? 'bg-primary-600/15 border-primary-500 text-primary-700 dark:text-primary-300 shadow-md shadow-primary-500/10 translate-y-[-2px]'
                        : 'bg-slate-900/5 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-900/10 dark:hover:bg-slate-900/70 text-slate-500 dark:text-slate-200 hover:text-slate-700 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="font-semibold">{opt}</span>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      isSelected ? 'border-primary-400 bg-primary-500 text-white' : 'border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/40 dark:border-slate-850 mt-8">
            <Button
              onClick={handlePrev}
              disabled={activeIdx === 0}
              variant="secondary"
              icon={ArrowLeft}
              size="sm"
            >
              {getTranslation('previousLabel')}
            </Button>

            {activeIdx === testQuestions.length - 1 ? (
              <Button
                onClick={submitAnswers}
                variant="primary"
                icon={Check}
                className="shadow-lg shadow-primary-600/20"
              >
                {getTranslation('submitTest')}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="secondary"
                icon={ArrowRight}
                size="sm"
              >
                {getTranslation('nextLabel')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
          <ClipboardList className="w-8 h-8 text-primary-400" />
          {getTranslation('aptitudeArenaTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {getTranslation('aptitudeArenaDescription')}
        </p>
      </div>

      {/* Start Quiz Card */}
      <Card
        title={getTranslation('startAptitudeChallenge')}
        subtitle={getTranslation('aptitudeChallengeDescription')}
        className="border border-slate-200/50 dark:border-slate-800/80"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              {getTranslation('chooseTestCategory')}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600/20 border-primary-500 text-primary-700 dark:text-primary-300 shadow-md shadow-primary-500/5 scale-[1.03]'
                      : 'bg-slate-900/5 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-400/50 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? getTranslation('allLabel') : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-500 dark:text-slate-400 flex gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">{getTranslation('rulesAndSetup')}</span>
              {getTranslation('aptitudeRulesDescription')}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/40 dark:border-slate-850 flex justify-end">
            <Button
              onClick={handleStartTest}
              icon={RefreshCw}
              variant="primary"
              className="shadow-lg shadow-primary-600/20 rounded-xl"
            >
              {getTranslation('beginQuiz')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AptitudeTest;
