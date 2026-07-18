import api from './api';
import { askGemini, INTERVIEW_SYSTEM_PROMPT } from './geminiService';

// Initial Mock Interview Questions
const defaultInterviewTemplates = [
  {
    id: 'role-react',
    title: 'Frontend Engineer (React)',
    category: 'Frontend',
    difficulty: 'Intermediate',
    description: 'Focuses on React components, lifecycle, hooks, state management, and performance.',
    questions: [
      { id: 'q-react-1', text: 'Explain the difference between functional and class components in React. Why did React introduce Hooks?' },
      { id: 'q-react-2', text: 'How does React Virtual DOM work under the hood, and what are the main benefits?' },
      { id: 'q-react-3', text: 'Describe how you manage global state in a large-scale React application. When would you choose context API vs Redux/Zustand?' },
      { id: 'q-react-4', text: 'What is the purpose of useEffect cleanups, and how do you prevent memory leaks when dealing with web socket subscriptions?' }
    ]
  },
  {
    id: 'role-node',
    title: 'Backend Engineer (Node/Express)',
    category: 'Backend',
    difficulty: 'Advanced',
    description: 'Covers event loop, asynchronous design patterns, RESTful design, and security.',
    questions: [
      { id: 'q-node-1', text: 'Explain how the Node.js Event Loop works. What are macrotasks and microtasks?' },
      { id: 'q-node-2', text: 'How do you secure Express.js routes against common vulnerabilities like SQL injection, CSRF, and XSS?' },
      { id: 'q-node-3', text: 'Describe a scenario where you would use Streams in Node.js instead of standard file system buffer methods.' },
      { id: 'q-node-4', text: 'What is your approach to handling transactions and concurrent updates in databases like MongoDB or PostgreSQL?' }
    ]
  },
  {
    id: 'role-hr',
    title: 'HR & Behavioral Round',
    category: 'Behavioral',
    difficulty: 'Beginner',
    description: 'General HR behavioral questions assessing cultural fit, conflict resolution, and leadership.',
    questions: [
      { id: 'q-hr-1', text: 'Tell me about a time when you had a conflict with a teammate or manager. How did you resolve it?' },
      { id: 'q-hr-2', text: 'What is your greatest technical achievement, and what did you learn from the process?' },
      { id: 'q-hr-3', text: 'Describe a situation where you had to work under a tight deadline and how you prioritized tasks.' },
      { id: 'q-hr-4', text: 'Why do you want to join our company, and where do you see your career heading in the next 3 to 5 years?' }
    ]
  }
];

// Initial Aptitude Test Questions
const defaultAptitudeQuestions = [
  // Quantitative
  {
    id: 'apt-1',
    category: 'Quantitative',
    question: 'A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. What is the speed of the train?',
    options: ['45 km/hr', '50 km/hr', '54 km/hr', '60 km/hr'],
    correctAnswer: 1, // index 1: 50 km/hr
    explanation: 'Speed of the train relative to man = 125/10 m/sec = 12.5 m/sec = 12.5 * 18/5 km/hr = 45 km/hr. Let speed of train be x. Relative speed = x - 5 = 45. Hence, x = 50 km/hr.'
  },
  {
    id: 'apt-2',
    category: 'Quantitative',
    question: 'If 20% of a = b, then b% of 20 is the same as:',
    options: ['4% of a', '5% of a', '20% of a', 'None of these'],
    correctAnswer: 0, // index 0: 4% of a
    explanation: '20% of a = b ==> (20/100)*a = b. b% of 20 = (b/100)*20 = ((20*a/100)/100)*20 = (4/100)*a = 4% of a.'
  },
  // Logical
  {
    id: 'apt-3',
    category: 'Logical',
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    options: ['1/3', '1/8', '2/8', '1/16'],
    correctAnswer: 1, // index 1: 1/8
    explanation: 'This is a simple division series; each number is one-half of the previous number. 1/4 divided by 2 is 1/8.'
  },
  {
    id: 'apt-4',
    category: 'Logical',
    question: 'Which word does NOT belong with the others?',
    options: ['Parsley', 'Basil', 'Dill', 'Mayonnaise'],
    correctAnswer: 3, // index 3: Mayonnaise
    explanation: 'Parsley, basil, and dill are herbs. Mayonnaise is a condiment.'
  },
  // Verbal
  {
    id: 'apt-5',
    category: 'Verbal',
    question: 'Select the synonym of "ABANDON":',
    options: ['Forsake', 'Keep', 'Cherish', 'Pursue'],
    correctAnswer: 0,
    explanation: 'To abandon means to leave behind or run away from. "Forsake" is a direct synonym.'
  },
  // CS Fundamentals
  {
    id: 'apt-6',
    category: 'CS Fundamentals',
    question: 'Which of the following sorting algorithms has the best worst-case time complexity?',
    options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort'],
    correctAnswer: 3, // Merge Sort: O(n log n)
    explanation: 'Merge Sort has a worst-case time complexity of O(n log n), while Quick Sort has O(n^2) and Bubble/Insertion have O(n^2).'
  }
];

// Initial Past Performance Reports
const defaultPastInterviews = [
  {
    id: 'int-report-1',
    roleTitle: 'Frontend Engineer (React)',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 380, // seconds
    overallScore: 78,
    technicalScore: 82,
    behavioralScore: 74,
    feedback: 'Alex demonstrated strong fundamental skills in React hooks and rendering pipelines. Improvement is needed in explaining state management side-effects and handling subscription cleanup.',
    qaList: [
      {
        question: 'Explain the difference between functional and class components in React. Why did React introduce Hooks?',
        userAnswer: 'Functional components are functions that return JSX, while class components extend React.Component. Hooks were introduced to allow functional components to have state and lifecycle methods without writing classes.',
        aiFeedback: 'Excellent explanation. You hit all the major points, mentioning code structure and state management. To improve, mention readability and reusability of logic with custom hooks.',
        suggestedAnswer: 'Functional components are simpler, lighter JavaScript functions. Class components require boilerplates and handling "this" context. Hooks were introduced in React 16.8 to share stateful logic without changing component hierarchy, reducing prop drilling and side-effect spaghetti.',
        score: 85
      },
      {
        question: 'How does React Virtual DOM work under the hood, and what are the main benefits?',
        userAnswer: 'Virtual DOM is a copy of the real DOM. React updates it first, then compares it with the previous version to find differences, and updates only those parts of the real DOM.',
        aiFeedback: 'Correct concept of diffing. You could expand on the "reconciliation" process and the Fiber engine to show deeper expertise.',
        suggestedAnswer: 'The Virtual DOM is a lightweight, in-memory representation of the real DOM. When state changes, React builds a new virtual tree, performs a diffing algorithm (reconciliation) to compute minimal DOM mutations, and batches these updates. This avoids expensive layout recalculations in the browser.',
        score: 75
      }
    ]
  }
];

const interviewService = {
  getTemplates: async () => {
    const response = await api.get('/interview/templates');
    return response.data;
  },

  saveTemplates: async (templates) => {
    // Optionally handled on backend
  },

  getPastInterviews: async () => {
    const response = await api.get('/interview/history');
    return response.data;
  },

  cacheProgress: async (templateId, qaPairs) => {
    // State Retention Lock: Cache mid-session data
    try {
      localStorage.setItem(`interview_cache_${templateId}`, JSON.stringify(qaPairs));
    } catch (e) {
      console.warn("Failed to cache interview progress", e);
    }
  },

  submitInterview: async (templateId, qaPairs, durationSeconds, disqualified = false, presenceScore = 100) => {
    // Clear the retention lock cache on successful submission
    localStorage.removeItem(`interview_cache_${templateId}`);
    
    const response = await api.post('/interview/submit', { templateId, qaPairs, durationSeconds, disqualified, presenceScore });
    
    // Update dashboard readiness score locally for immediate UI reflection
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.readinessScore = response.data.overallScore;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch (_e) {}

    return response.data;
  },

  getAptitudeQuestions: async () => {
    const response = await api.get('/interview/aptitude');
    return response.data;
  },

  saveAptitudeQuestions: async (questions) => {
    // Optionally handled on backend
  },

  saveTestResult: async (result) => {
    const response = await api.post('/interview/aptitude/submit', result);

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.aptitudeScore = result.percentage;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch (_e) {}

    return response.data;
  },

  getTestResults: async () => {
    const response = await api.get('/interview/aptitude/history');
    return response.data;
  },

  startSession: async (templateId) => {
    const response = await api.post('/interview/session-start', { templateId });
    return response.data;
  },

  logWarning: async (templateId, type, message, warningCount) => {
    const response = await api.post('/interview/log-warning', { templateId, type, message, warningCount });
    return response.data;
  },

  logActivity: async (templateId, action, details) => {
    const response = await api.post('/interview/log-activity', { templateId, action, details });
    return response.data;
  },

  getWarningsList: async () => {
    const response = await api.get('/interview/warnings');
    return response.data;
  },

  getActivityLogsList: async () => {
    const response = await api.get('/interview/activities');
    return response.data;
  },

  getNexusMemory: async () => {
    const response = await api.get('/nexus/memory');
    return response.data;
  },

  updateNexusMemory: async (memoryData) => {
    const response = await api.post('/nexus/memory', memoryData);
    return response.data;
  },

  logNexusInteraction: async (logData) => {
    const response = await api.post('/nexus/log-interaction', logData);
    return response.data;
  },

  chatNexus: async (messages, systemInstruction = '') => {
    const response = await api.post('/nexus/chat', { messages, systemInstruction });
    return response.data;
  },

  getNexusConfig: async () => {
    const response = await api.get('/nexus/config');
    return response.data;
  },

  updateNexusConfig: async (configData) => {
    const response = await api.post('/nexus/config', configData);
    return response.data;
  },

  getNexusGlobalAnalytics: async () => {
    const response = await api.get('/nexus/global-analytics');
    return response.data;
  },

  simulateNexusFinetuning: async () => {
    const response = await api.post('/nexus/fine-tune/simulate');
    return response.data;
  }
};

export default interviewService;
