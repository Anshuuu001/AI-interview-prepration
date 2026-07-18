import React, { useEffect, useState } from 'react';
import interviewService from '../../services/interviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Settings, Plus, Trash, BookOpen, Video } from 'lucide-react';

const ManageQuestions = () => {
  const [activeTab, setActiveTab] = useState('interview');
  
  // Interview data states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newInterviewQuestion, setNewInterviewQuestion] = useState('');

  // Aptitude data states
  const [aptQuestions, setAptQuestions] = useState([]);
  const [newApt, setNewApt] = useState({
    category: 'Quantitative',
    question: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctAnswer: 0,
    explanation: ''
  });

  const loadData = async () => {
    try {
      const tpls = await interviewService.getTemplates() || [];
      setTemplates(tpls);
      if (tpls.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(tpls[0].id);
      }

      const apts = await interviewService.getAptitudeQuestions() || [];
      setAptQuestions(apts);
    } catch (err) {
      console.error("Failed to load questions database:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Interview CRUD handlers ---
  const handleAddInterviewQuestion = (e) => {
    e.preventDefault();
    if (!newInterviewQuestion.trim() || !selectedTemplateId) return;

    const updated = templates.map(tpl => {
      if (tpl.id === selectedTemplateId) {
        return {
          ...tpl,
          questions: [
            ...tpl.questions,
            { id: `q-custom-${Date.now()}`, text: newInterviewQuestion.trim() }
          ]
        };
      }
      return tpl;
    });

    interviewService.saveTemplates(updated);
    setNewInterviewQuestion('');
    loadData();
  };

  const handleDeleteInterviewQuestion = (templateId, questionId) => {
    const updated = templates.map(tpl => {
      if (tpl.id === templateId) {
        return {
          ...tpl,
          questions: tpl.questions.filter(q => q.id !== questionId)
        };
      }
      return tpl;
    });

    interviewService.saveTemplates(updated);
    loadData();
  };

  // --- Aptitude CRUD handlers ---
  const handleAddAptitudeQuestion = (e) => {
    e.preventDefault();
    const { category, question, optA, optB, optC, optD, correctAnswer, explanation } = newApt;
    if (!question.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) return;

    const newQ = {
      id: `apt-custom-${Date.now()}`,
      category,
      question: question.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctAnswer: parseInt(correctAnswer, 10),
      explanation: explanation.trim() || 'No custom explanation provided.'
    };

    const updated = [...aptQuestions, newQ];
    interviewService.saveAptitudeQuestions(updated);
    
    // Reset form
    setNewApt({
      category: 'Quantitative',
      question: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctAnswer: 0,
      explanation: ''
    });
    loadData();
  };

  const handleDeleteAptitudeQuestion = (id) => {
    const updated = aptQuestions.filter(q => q.id !== id);
    interviewService.saveAptitudeQuestions(updated);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          Manage Question Bank
        </h2>
        <p className="text-xs text-slate-400">Configure questions databases for technical mock rounds and timed aptitude quizzes.</p>
      </div>

      {/* Tabs selectors */}
      <div className="flex border-b border-slate-800 -mx-6 px-6 bg-slate-900/10">
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'interview'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4" />
          Mock Interview Templates
        </button>
        <button
          onClick={() => setActiveTab('aptitude')}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'aptitude'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Aptitude MCQs Database
        </button>
      </div>

      {/* Tab content 1: Interview templates */}
      {activeTab === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Interview Question Panel */}
          <div className="space-y-6">
            <Card title="Add Question to Template" subtitle="Insert custom questions into existing role structures.">
              <form onSubmit={handleAddInterviewQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Target Role Profile
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/5 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl text-slate-100 text-sm focus:outline-none"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Question Text
                  </label>
                  <textarea
                    rows={4}
                    value={newInterviewQuestion}
                    onChange={(e) => setNewInterviewQuestion(e.target.value)}
                    placeholder="Enter question text to speak..."
                    className="w-full px-4 py-2.5 bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none resize-none"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" icon={Plus} className="w-full mt-4">
                  Add to Template
                </Button>
              </form>
            </Card>
          </div>

          {/* Templates list with CRUD deletes */}
          <div className="lg:col-span-2 space-y-6">
            {templates.map((tpl) => (
              <Card
                key={tpl.id}
                title={tpl.title}
                subtitle={`${tpl.category} round • ${tpl.questions.length} questions total`}
              >
                <div className="divide-y divide-slate-850">
                  {tpl.questions.map((q, idx) => (
                    <div key={q.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span className="text-xs font-bold text-slate-500 mt-0.5">{idx + 1}.</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-light">{q.text}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteInterviewQuestion(tpl.id, q.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1.5"
                        title="Delete question"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab content 2: Aptitude questions */}
      {activeTab === 'aptitude' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Aptitude Question Panel */}
          <div className="space-y-6">
            <Card title="Add Aptitude Question" subtitle="Create multiple choice questions.">
              <form onSubmit={handleAddAptitudeQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Topic Category
                  </label>
                  <select
                    value={newApt.category}
                    onChange={(e) => setNewApt({ ...newApt, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/5 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl text-slate-100 text-sm focus:outline-none"
                  >
                    <option value="Quantitative">Quantitative</option>
                    <option value="Logical">Logical</option>
                    <option value="Verbal">Verbal</option>
                    <option value="CS Fundamentals">CS Fundamentals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={newApt.question}
                    onChange={(e) => setNewApt({ ...newApt, question: e.target.value })}
                    placeholder="e.g. Find the sum of first 50 natural numbers."
                    className="w-full px-4 py-2.5 bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none"
                    required
                  />
                </div>

                {/* Options grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Option A</label>
                    <input
                      type="text"
                      value={newApt.optA}
                      onChange={(e) => setNewApt({ ...newApt, optA: e.target.value })}
                      placeholder="Option A"
                      className="w-full px-3 py-2 bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Option B</label>
                    <input
                      type="text"
                      value={newApt.optB}
                      onChange={(e) => setNewApt({ ...newApt, optB: e.target.value })}
                      placeholder="Option B"
                      className="w-full px-3 py-2 bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Option C</label>
                    <input
                      type="text"
                      value={newApt.optC}
                      onChange={(e) => setNewApt({ ...newApt, optC: e.target.value })}
                      placeholder="Option C"
                      className="w-full px-3 py-2 bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Option D</label>
                    <input
                      type="text"
                      value={newApt.optD}
                      onChange={(e) => setNewApt({ ...newApt, optD: e.target.value })}
                      placeholder="Option D"
                      className="w-full px-3 py-2 bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Correct Answer Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Correct Option Index
                  </label>
                  <select
                    value={newApt.correctAnswer}
                    onChange={(e) => setNewApt({ ...newApt, correctAnswer: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 bg-slate-900/5 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl text-slate-100 text-sm focus:outline-none"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Correct Explanation
                  </label>
                  <textarea
                    rows={3}
                    value={newApt.explanation}
                    onChange={(e) => setNewApt({ ...newApt, explanation: e.target.value })}
                    placeholder="Why is this option correct?"
                    className="w-full px-4 py-2.5 bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none resize-none"
                  />
                </div>

                <Button type="submit" variant="primary" icon={Plus} className="w-full mt-4">
                  Add MCQ
                </Button>
              </form>
            </Card>
          </div>

          {/* MCQs Listing with deletes */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Aptitude Question Database" subtitle={`${aptQuestions.length} multiple choice questions found`}>
              <div className="divide-y divide-slate-850">
                {aptQuestions.map((q, idx) => (
                  <div key={q.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500">{idx + 1}.</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-100 font-semibold leading-relaxed">{q.question}</p>
                      
                      {/* Options render */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border ${
                              oIdx === q.correctAnswer
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 font-semibold'
                                : 'bg-slate-900/5 dark:bg-slate-900/35 border-slate-200 dark:border-slate-850 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAptitudeQuestion(q.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 flex-shrink-0"
                      title="Delete question"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
