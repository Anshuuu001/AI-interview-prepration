const db = require('../utils/mysql');
const { readData, writeData } = require('../utils/db');
const axios = require('axios');
const { callGeminiApi } = require('../utils/geminiHelper');

const APTITUDE_FILE = 'aptitude.json';
const TEMPLATES_FILE = 'templates.json';


// Simple helper to call Gemini directly from the backend
const evaluateWithGemini = async (prompt, systemInstruction, customKey) => {
  return await callGeminiApi({
    history: [{ role: 'user', text: prompt }],
    systemInstruction,
    customKey
  });
};

// Default data to avoid cross-boundary require issues
const defaultInterviewTemplates = [
  {
    id: 'role-react',
    title: 'Frontend Engineer (React)',
    category: 'Frontend',
    difficulty: 'Intermediate',
    description: 'Focuses on React components, lifecycle, hooks, state management, and performance.',
    questionBank: [
      { id: 'q-react-1', text: 'Explain the difference between functional and class components in React. Why did React introduce Hooks?' },
      { id: 'q-react-2', text: 'How does React Virtual DOM work under the hood, and what are the main benefits?' },
      { id: 'q-react-3', text: 'Describe how you manage global state in a large-scale React application. When would you choose context API vs Redux/Zustand?' },
      { id: 'q-react-4', text: 'What is the purpose of useEffect cleanups, and how do you prevent memory leaks when dealing with web socket subscriptions?' },
      { id: 'q-react-5', text: 'Can you explain the concept of Higher-Order Components (HOC) and how they compare to custom hooks?' },
      { id: 'q-react-6', text: 'What are React Server Components and how do they differ from Server-Side Rendering (SSR)?' },
      { id: 'q-react-7', text: 'How do you optimize the performance of a React application with a very large list of data?' },
      { id: 'q-react-8', text: 'Explain the React reconciliation process and the role of the "key" prop in lists.' },
      { id: 'q-react-9', text: 'How would you handle error boundaries in a functional component based application?' },
      { id: 'q-react-10', text: 'Describe the differences between useMemo, useCallback, and React.memo.' },
      { id: 'q-react-11', text: 'Explain how React handles event delegation under the hood.' },
      { id: 'q-react-12', text: 'What is the purpose of React.Profiler and how do you use it to identify bottlenecks?' },
      { id: 'q-react-13', text: 'Explain the difference between Controlled and Uncontrolled inputs in React form management.' },
      { id: 'q-react-14', text: 'How do you implement code-splitting in React using dynamic imports and React.lazy?' },
      { id: 'q-react-15', text: 'What are React Portals and when would you use them for modal overlays or dialog boxes?' }
    ]
  },
  {
    id: 'role-video-react',
    title: 'Frontend Proctored (React)',
    category: 'Frontend Video',
    difficulty: 'Advanced',
    isVideo: true,
    description: 'Live video proctored interview assessing advanced React architecture, state management, and performance.',
    questionBank: [
      { id: 'q-vid-react-1', text: 'How do you structure a large scale React application for maintainability?' },
      { id: 'q-vid-react-2', text: 'Can you walk me through how you would implement server-side rendering in a React application?' },
      { id: 'q-vid-react-3', text: 'What are some common security vulnerabilities in React applications and how do you mitigate them?' },
      { id: 'q-vid-react-4', text: 'Describe your approach to testing React components. What tools do you use?' },
      { id: 'q-vid-react-5', text: 'How do you handle routing and code splitting in a complex React SPA?' },
      { id: 'q-vid-react-6', text: 'Explain the concept of compound components in React and give a production example.' },
      { id: 'q-vid-react-7', text: 'How do you optimize state transitions in React to prevent unnecessary child component re-renders?' },
      { id: 'q-vid-react-8', text: 'What are the main differences between custom hooks and the render props pattern?' },
      { id: 'q-vid-react-9', text: 'How would you handle theme switching dynamically using CSS variables and React Context API?' },
      { id: 'q-vid-react-10', text: 'Explain the differences between client-side rendering (CSR) and static site generation (SSG) in React.' }
    ]
  },
  {
    id: 'role-node',
    title: 'Backend Engineer (Node/Express)',
    category: 'Backend',
    difficulty: 'Advanced',
    description: 'Covers event loop, asynchronous design patterns, RESTful design, and security.',
    questionBank: [
      { id: 'q-node-1', text: 'Explain how the Node.js Event Loop works. What are macrotasks and microtasks?' },
      { id: 'q-node-2', text: 'How do you secure Express.js routes against common vulnerabilities like SQL injection, CSRF, and XSS?' },
      { id: 'q-node-3', text: 'Describe a scenario where you would use Streams in Node.js instead of standard file system buffer methods.' },
      { id: 'q-node-4', text: 'What is your approach to handling transactions and concurrent updates in databases like MongoDB or PostgreSQL?' },
      { id: 'q-node-5', text: 'How do you handle memory leaks in a Node.js application, and what tools do you use for profiling?' },
      { id: 'q-node-6', text: 'Explain the difference between clustered environments and worker threads in Node.js.' },
      { id: 'q-node-7', text: 'How would you design a rate-limiting middleware for an Express API?' },
      { id: 'q-node-8', text: 'What are the pros and cons of using GraphQL over REST for a Node.js backend?' },
      { id: 'q-node-9', text: 'Describe your strategy for centralized error handling and logging in a microservices architecture.' },
      { id: 'q-node-10', text: 'How does JWT authentication work, and how do you handle token revocation?' },
      { id: 'q-node-11', text: 'Explain how the child_process module works in Node.js and when to use fork.' },
      { id: 'q-node-12', text: 'What is the purpose of the cluster module and how does it scale applications across CPU cores?' },
      { id: 'q-node-13', text: 'How do you analyze a heap dump to debug memory leaks in a running Node.js process?' },
      { id: 'q-node-14', text: 'Explain how middleware execution order and flow control works in Express.js.' },
      { id: 'q-node-15', text: 'What are environment variables and why should you avoid checking them directly into source control?' }
    ]
  },
  {
    id: 'role-hr',
    title: 'HR & Behavioral Round',
    category: 'Behavioral',
    difficulty: 'Beginner',
    description: 'General HR behavioral questions assessing cultural fit, conflict resolution, and leadership.',
    questionBank: [
      { id: 'q-hr-1', text: 'Tell me about a time when you had a conflict with a teammate or manager. How did you resolve it?' },
      { id: 'q-hr-2', text: 'What is your greatest technical achievement, and what did you learn from the process?' },
      { id: 'q-hr-3', text: 'Describe a situation where you had to work under a tight deadline and how you prioritized tasks.' },
      { id: 'q-hr-4', text: 'Why do you want to join our company, and where do you see your career heading in the next 3 to 5 years?' },
      { id: 'q-hr-5', text: 'Tell me about a time you failed or made a significant mistake. How did you handle the aftermath?' },
      { id: 'q-hr-6', text: 'Describe a situation where you had to quickly learn a new technology or concept.' },
      { id: 'q-hr-7', text: 'How do you handle feedback or criticism from a peer code review?' },
      { id: 'q-hr-8', text: 'Tell me about a time you went above and beyond your standard responsibilities to help a team succeed.' },
      { id: 'q-hr-9', text: 'How do you balance technical debt with the pressure to deliver new features quickly?' },
      { id: 'q-hr-10', text: 'Describe a time when you had to explain a complex technical concept to a non-technical stakeholder.' },
      { id: 'q-hr-11', text: 'Describe a time when you received difficult feedback. How did you react and what changes did you make?' },
      { id: 'q-hr-12', text: 'How do you proactively stay updated with the latest technological developments and frameworks?' },
      { id: 'q-hr-13', text: 'Describe your process for prioritizing tasks when everything seems urgent and high priority.' },
      { id: 'q-hr-14', text: 'How do you manage stress or prevent burnout during highly demanding release cycles?' },
      { id: 'q-hr-15', text: 'What is your preference: working in a highly collaborative team or independently, and why?' }
    ]
  },
  {
    id: 'role-sys-design',
    title: 'System Architect',
    category: 'System Design',
    difficulty: 'Expert',
    description: 'Advanced systems architecture, scaling databases, caching strategy, microservices, and high-availability designs.',
    questionBank: [
      { id: 'q-sys-1', text: 'Design a highly-available, scalable notification system. How do you handle deduping and rate limiting?' },
      { id: 'q-sys-2', text: 'Explain the CAP theorem. In what scenarios would you choose AP (Availability-Partition) over CP (Consistency-Partition)?' },
      { id: 'q-sys-3', text: 'How do you design a global content delivery caching layer, and how do you handle cache invalidation at scale?' },
      { id: 'q-sys-4', text: 'Design a distributed lock manager. What algorithms or existing technologies would you leverage?' },
      { id: 'q-sys-5', text: 'How would you architect a real-time collaborative document editor like Google Docs?' },
      { id: 'q-sys-6', text: 'Explain how Consistent Hashing works and why it is useful in distributed caching or database sharding.' },
      { id: 'q-sys-7', text: 'Design a ride-sharing service like Uber. Focus on the dispatcher service and geospatial querying.' },
      { id: 'q-sys-8', text: 'What are the main differences between event-driven architecture and request-response architecture?' },
      { id: 'q-sys-9', text: 'How do you ensure idempotency in a distributed payment processing system?' },
      { id: 'q-sys-10', text: 'Describe your approach to database sharding vs replication. When would you use one over the other?' },
      { id: 'q-sys-11', text: 'Explain the difference between SQL and NoSQL databases. When do you use each architecture?' },
      { id: 'q-sys-12', text: 'What is rate limiting, and what are the main algorithms used to implement it at API gateway level?' },
      { id: 'q-sys-13', text: 'How do you design a system for high availability and disaster recovery across multiple regions?' },
      { id: 'q-sys-14', text: 'Explain how a message queue like RabbitMQ or Kafka helps decouple microservices.' },
      { id: 'q-sys-15', text: 'How do you handle API versioning at scale without breaking client implementations?' }
    ]
  },
  {
    id: 'vid-hr',
    title: 'HR Interview',
    category: 'HR',
    difficulty: 'General',
    isVideo: true,
    description: 'General behavioral and cultural fit questions for any role.',
    questionBank: [
      { id: 'v-hr-1', text: 'Tell me about a time you handled a difficult situation with a coworker.' },
      { id: 'v-hr-2', text: 'What is your greatest strength and your greatest weakness?' },
      { id: 'v-hr-3', text: 'Where do you see yourself in 5 years?' },
      { id: 'v-hr-4', text: 'Why are you leaving your current role?' },
      { id: 'v-hr-5', text: 'Describe a time you showed leadership.' },
      { id: 'v-hr-6', text: 'What motivates you most in a professional workspace environment?' },
      { id: 'v-hr-7', text: 'How do you handle differences of opinion when working inside a remote team?' },
      { id: 'v-hr-8', text: 'Tell me about a time you had to learn a completely new skill very quickly.' },
      { id: 'v-hr-9', text: 'Why do you believe you are the best fit for this specific position?' },
      { id: 'v-hr-10', text: 'How do you manage professional pressure and tight production deadlines?' }
    ]
  },
  {
    id: 'vid-java',
    title: 'Java',
    category: 'Backend',
    difficulty: 'Intermediate',
    isVideo: true,
    description: 'Technical questions covering core Java, JVM, multithreading, and OOP.',
    questionBank: [
      { id: 'v-java-1', text: 'Explain the difference between JDK, JRE, and JVM.' },
      { id: 'v-java-2', text: 'How does garbage collection work in Java?' },
      { id: 'v-java-3', text: 'What is the difference between an abstract class and an interface?' },
      { id: 'v-java-4', text: 'Explain the concept of multithreading in Java and how to create a thread.' },
      { id: 'v-java-5', text: 'What are the main differences between HashMap and ConcurrentHashMap?' },
      { id: 'v-java-6', text: 'Explain the difference between final, finally, and finalize keywords in Java.' },
      { id: 'v-java-7', text: 'What is the Java Reflection API and in what scenarios would you use it?' },
      { id: 'v-java-8', text: 'Explain the difference between fail-fast and fail-safe iterators in collections.' },
      { id: 'v-java-9', text: 'What are Lambda expressions in Java 8 and how do they improve code readability?' },
      { id: 'v-java-10', text: 'How does the object serialization mechanism work in Java?' }
    ]
  },
  {
    id: 'vid-c',
    title: 'C Programming',
    category: 'Systems',
    difficulty: 'Intermediate',
    isVideo: true,
    description: 'Core concepts in C including pointers, memory management, and data structures.',
    questionBank: [
      { id: 'v-c-1', text: 'Explain the difference between malloc() and calloc().' },
      { id: 'v-c-2', text: 'What is a pointer to a pointer in C?' },
      { id: 'v-c-3', text: 'Describe how memory leaks occur in C and how to prevent them.' },
      { id: 'v-c-4', text: 'What is the purpose of the volatile keyword?' },
      { id: 'v-c-5', text: 'Explain the difference between a macro and an inline function.' },
      { id: 'v-c-6', text: 'Explain the differences between a struct and a union in C.' },
      { id: 'v-c-7', text: 'What are function pointers in C and what is their primary use case?' },
      { id: 'v-c-8', text: 'Explain the difference between stack and heap memory allocation in C.' },
      { id: 'v-c-9', text: 'What is the static keyword used for in C variables and functions?' },
      { id: 'v-c-10', text: 'Explain the purpose of the const keyword when used with pointer declarations.' }
    ]
  },
  {
    id: 'vid-python',
    title: 'Python',
    category: 'General',
    difficulty: 'Intermediate',
    isVideo: true,
    description: 'Python fundamentals, data structures, decorators, and memory management.',
    questionBank: [
      { id: 'v-py-1', text: 'Explain the difference between a list and a tuple in Python.' },
      { id: 'v-py-2', text: 'What is the Global Interpreter Lock (GIL)?' },
      { id: 'v-py-3', text: 'How do decorators work in Python?' },
      { id: 'v-py-4', text: 'Explain list comprehensions with an example.' },
      { id: 'v-py-5', text: 'How is memory managed in Python?' },
      { id: 'v-py-6', text: 'Explain the difference between a deep copy and a shallow copy in Python.' },
      { id: 'v-py-7', text: 'What is a list comprehension and a dict comprehension in Python?' },
      { id: 'v-py-8', text: 'How do generators work in Python and why are they memory efficient?' },
      { id: 'v-py-9', text: 'What is the difference between *args and **kwargs in Python function definitions?' },
      { id: 'v-py-10', text: 'Explain how exception handling works with try-except-finally blocks.' }
    ]
  },
  {
    id: 'vid-html',
    title: 'HTML',
    category: 'Frontend',
    difficulty: 'Beginner',
    isVideo: true,
    description: 'HTML5 features, semantics, accessibility, and DOM structure.',
    questionBank: [
      { id: 'v-html-1', text: 'What are semantic HTML elements and why are they important?' },
      { id: 'v-html-2', text: 'Explain the difference between block and inline elements.' },
      { id: 'v-html-3', text: 'How do you ensure a webpage is accessible for screen readers?' },
      { id: 'v-html-4', text: 'What is the purpose of the data-* attribute?' },
      { id: 'v-html-5', text: 'Explain the difference between local storage, session storage, and cookies.' },
      { id: 'v-html-6', text: 'What is the difference between HTML and XHTML?' },
      { id: 'v-html-7', text: 'Explain the purpose of SVG and Canvas in HTML5.' },
      { id: 'v-html-8', text: 'How do you use meta tags for SEO and responsive display viewport configuration?' },
      { id: 'v-html-9', text: 'What is the difference between block, inline, and inline-block elements?' },
      { id: 'v-html-10', text: 'What is semantic HTML and how does it help accessibility?' }
    ]
  },
  {
    id: 'vid-css',
    title: 'CSS',
    category: 'Frontend',
    difficulty: 'Intermediate',
    isVideo: true,
    description: 'CSS Box Model, layout models (Flexbox/Grid), animations, and responsive design.',
    questionBank: [
      { id: 'v-css-1', text: 'Explain the CSS Box Model.' },
      { id: 'v-css-2', text: 'What is the difference between Flexbox and CSS Grid?' },
      { id: 'v-css-3', text: 'How does CSS specificity work?' },
      { id: 'v-css-4', text: 'What are pseudo-classes and pseudo-elements?' },
      { id: 'v-css-5', text: 'Describe approaches to making a website responsive without media queries.' },
      { id: 'v-css-6', text: 'Explain the difference between absolute, relative, fixed, and sticky positioning.' },
      { id: 'v-css-7', text: 'What are CSS preprocessors like SASS or LESS, and why are they useful?' },
      { id: 'v-css-8', text: 'How do you implement CSS animations and transition keyframes?' },
      { id: 'v-css-9', text: 'What is a media query and how do you write responsive breakpoints?' },
      { id: 'v-css-10', text: 'Explain the concept of z-index and stacking contexts in CSS.' }
    ]
  },
  {
    id: 'vid-javascript',
    title: 'JavaScript',
    category: 'Frontend',
    difficulty: 'Intermediate',
    isVideo: true,
    description: 'Core JS concepts: closures, promises, event loop, and ES6+ features.',
    questionBank: [
      { id: 'v-js-1', text: 'Explain closures in JavaScript and provide an example of when to use one.' },
      { id: 'v-js-2', text: 'What is the difference between == and ===?' },
      { id: 'v-js-3', text: 'How does the event loop handle asynchronous operations?' },
      { id: 'v-js-4', text: 'Explain the difference between let, const, and var.' },
      { id: 'v-js-5', text: 'What is event bubbling and how can you stop it?' },
      { id: 'v-js-6', text: 'Explain the difference between call, apply, and bind.' },
      { id: 'v-js-7', text: 'What is prototype-based inheritance in JavaScript?' },
      { id: 'v-js-8', text: 'How do Promises work and how do they compare to Async/Await?' },
      { id: 'v-js-9', text: 'What is the difference between map, filter, and reduce array methods?' },
      { id: 'v-js-10', text: 'Explain the concept of event bubbling and event capturing.' }
    ]
  },
  {
    id: 'vid-webdev',
    title: 'Web Development',
    category: 'Fullstack',
    difficulty: 'Intermediate',
    isVideo: true,
    description: 'General web architecture, REST APIs, HTTP protocols, and security.',
    questionBank: [
      { id: 'v-web-1', text: 'Explain the difference between HTTP and HTTPS.' },
      { id: 'v-web-2', text: 'What is a RESTful API and what are its core principles?' },
      { id: 'v-web-3', text: 'Describe Cross-Origin Resource Sharing (CORS) and why it exists.' },
      { id: 'v-web-4', text: 'What happens when you type a URL into a browser and press enter?' },
      { id: 'v-web-5', text: 'Explain how you would optimize a website for better performance.' },
      { id: 'v-web-6', text: 'What is DOM and how does browser render HTML pages?' },
      { id: 'v-web-7', text: 'Explain standard status codes: 200, 301, 400, 401, 403, 404, 500.' },
      { id: 'v-web-8', text: 'How does client-side caching work using ETag and Cache-Control headers?' },
      { id: 'v-web-9', text: 'What is DNS and how does it resolve domain names to IP addresses?' },
      { id: 'v-web-10', text: 'Explain the difference between WebSockets and long polling.' }
    ]
  },
  {
    id: 'vid-auth',
    title: 'Authentication',
    category: 'Security',
    difficulty: 'Advanced',
    isVideo: true,
    description: 'OAuth, JWTs, session management, and securing web applications.',
    questionBank: [
      { id: 'v-auth-1', text: 'Explain how JSON Web Tokens (JWT) work.' },
      { id: 'v-auth-2', text: 'What is the difference between authentication and authorization?' },
      { id: 'v-auth-3', text: 'Describe the OAuth 2.0 flow.' },
      { id: 'v-auth-4', text: 'How do you securely store passwords in a database?' },
      { id: 'v-auth-5', text: 'What are common vulnerabilities related to session management and how do you prevent them?' },
      { id: 'v-auth-6', text: 'What is single sign-on (SSO) and how does it work?' },
      { id: 'v-auth-7', text: 'Explain multi-factor authentication (MFA) and common implementations.' },
      { id: 'v-auth-8', text: 'What is Session hijacking and how do you protect against it?' },
      { id: 'v-auth-9', text: 'Explain the difference between OAuth2 and SAML.' },
      { id: 'v-auth-10', text: 'What is CSRF token validation and why is it required for secure forms?' }
    ]
  }
];

const defaultAptitudeQuestions = [
  {
    id: 'apt-1',
    category: 'Quantitative',
    question: 'A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. What is the speed of the train?',
    options: ['45 km/hr', '50 km/hr', '54 km/hr', '60 km/hr'],
    correctAnswer: 1,
    explanation: 'Speed of the train relative to man = 125/10 m/sec = 12.5 m/sec = 12.5 * 18/5 km/hr = 45 km/hr. Let speed of train be x. Relative speed = x - 5 = 45. Hence, x = 50 km/hr.'
  },
  {
    id: 'apt-2',
    category: 'Quantitative',
    question: 'If 20% of a = b, then b% of 20 is the same as:',
    options: ['4% of a', '5% of a', '20% of a', 'None of these'],
    correctAnswer: 0,
    explanation: '20% of a = b ==> (20/100)*a = b. b% of 20 = (b/100)*20 = ((20*a/100)/100)*20 = (4/100)*a = 4% of a.'
  },
  {
    id: 'apt-3',
    category: 'Logical',
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    options: ['1/3', '1/8', '2/8', '1/16'],
    correctAnswer: 1,
    explanation: 'This is a simple division series; each number is one-half of the previous number. 1/4 divided by 2 is 1/8.'
  },
  {
    id: 'apt-4',
    category: 'Logical',
    question: 'Which word does NOT belong with the others?',
    options: ['Parsley', 'Basil', 'Dill', 'Mayonnaise'],
    correctAnswer: 3,
    explanation: 'Parsley, basil, and dill are herbs. Mayonnaise is a condiment.'
  },
  {
    id: 'apt-5',
    category: 'Verbal',
    question: 'Select the synonym of "ABANDON":',
    options: ['Forsake', 'Keep', 'Cherish', 'Pursue'],
    correctAnswer: 0,
    explanation: 'To abandon means to leave behind or run away from. "Forsake" is a direct synonym.'
  },
  {
    id: 'apt-6',
    category: 'CS Fundamentals',
    question: 'Which of the following sorting algorithms has the best worst-case time complexity?',
    options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort'],
    correctAnswer: 3,
    explanation: 'Merge Sort has a worst-case time complexity of O(n log n), while Quick Sort has O(n^2) and Bubble/Insertion have O(n^2).'
  }
];

const getTemplates = (req, res) => {
  // Dynamically generate the templates with 5 random questions each
  const dynamicTemplates = defaultInterviewTemplates.map(template => {
    // Copy the question bank
    const shuffled = [...template.questionBank].sort(() => 0.5 - Math.random());
    // Select exactly 5 questions
    const selectedQuestions = shuffled.slice(0, 5);
    
    return {
      ...template,
      questions: selectedQuestions,
      questionBank: undefined // Don't send the entire bank to the frontend
    };
  });

  // We no longer strictly cache this to TEMPLATES_FILE because we want it to be dynamic per request.
  // We'll write it just so the submit route can read the basic template info.
  writeData(TEMPLATES_FILE, dynamicTemplates);
  
  res.json(dynamicTemplates);
};

const getHistory = async (req, res) => {
  try {
    const [reports] = await db.execute(
      'SELECT r.*, GROUP_CONCAT(q.id) as qa_ids FROM interview_reports r LEFT JOIN interview_qa q ON q.report_id = r.id WHERE r.user_id=? GROUP BY r.id ORDER BY r.date DESC',
      [req.user.id]
    );
    const [qaAll] = await db.execute(
      'SELECT * FROM interview_qa WHERE report_id IN (SELECT id FROM interview_reports WHERE user_id=?)',
      [req.user.id]
    );
    const result = reports.map(r => ({
      id: r.id,
      userId: r.user_id,
      roleTitle: r.role_title,
      date: r.date,
      duration: r.duration,
      overallScore: r.overall_score,
      technicalScore: r.technical_score,
      behavioralScore: r.behavioral_score,
      presenceScore: r.presence_score,
      integrityScore: r.integrity_score,
      warningsCount: r.warnings_count,
      cheatingRisk: r.cheating_risk,
      feedback: r.feedback,
      qaList: qaAll.filter(q => q.report_id === r.id).map(q => ({
        question: q.question,
        userAnswer: q.user_answer,
        score: q.score,
        correctness: q.correctness,
        technicalKnowledge: q.technical_knowledge
      }))
    }));
    res.json(result);
  } catch (err) {
    console.error('[getHistory error]', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

const submitInterview = async (req, res) => {
  const { templateId, qaPairs, durationSeconds, presenceScore = 100 } = req.body;
  const customKey = req.headers['x-gemini-key'];
  // Retrieve the base template to get the title
  const selected = defaultInterviewTemplates.find(t => t.id === templateId) || { title: 'General Interview' };

  let totalScore = 0;
  const systemPrompt = `You are an expert Human Resource (HR) and Technical Lead interviewer conducting a formal job placement round.
Evaluate the candidate's live answer for the given question.

Assess the response based on Technical Accuracy, Professional Communication, Structural Clarity, and Grammar.
Your response MUST be a single valid raw JSON object matching this structure exactly:

{
  "score": 1 to 10 integer scale,
  "correctness": "Percentage accuracy score (e.g., 85%)",
  "technicalKnowledge": "Granular feedback regarding what facts they got right or missed in their answer.",
  "communication": "Feedback on language clarity, sentence structure, and vocabulary choices.",
  "suggestions": "One concrete action item on how the student can articulate this specific answer better in a real campus drive."
}`;

  const evaluatedQaList = await Promise.all(
    qaPairs.map(async (pair) => {
      try {
        const wordCount = (pair.userAnswer || '').trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 5) throw new Error('Too short');

        const prompt = `QUESTION: "${pair.question}"\n\nCANDIDATE'S ANSWER: "${pair.userAnswer}"\n\nEvaluate strictly. Return only JSON.`;
        const rawJson = await evaluateWithGemini(prompt, systemPrompt, customKey);
        const cleaned = rawJson.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        const parsed = JSON.parse(cleaned);

        const scoreRaw = Number(parsed.score) || 3;
        // Scale 1-10 to 1-100
        const score = Math.max(0, Math.min(100, scoreRaw <= 10 ? scoreRaw * 10 : scoreRaw));
        totalScore += score;
        return { 
          ...pair, 
          technicalKnowledge: parsed.technicalKnowledge, 
          communication: parsed.communication, 
          suggestions: parsed.suggestions,
          correctness: parsed.correctness,
          score 
        };
      } catch (err) {
        const score = 35;
        totalScore += score;
        return { 
          ...pair, 
          technicalKnowledge: 'Answer was too brief or AI evaluation failed.', 
          communication: 'Unable to assess communication effectively.', 
          suggestions: 'Provide a detailed, technical answer with examples.', 
          correctness: '0%',
          score 
        };
      }
    })
  );

  const overallScore = Math.round(totalScore / qaPairs.length) || 0;

  // Read warning counts for this user's current session
  const warningLog = readData('warning_logs.json', []);
  const recentWarnings = warningLog.filter(w => w.userId === req.user.id && w.templateId === templateId && (Date.now() - w.timestamp) < 60 * 60 * 1000);
  const warningsCount = recentWarnings.length;

  let cheatingRisk = 'Low';
  let integrityScore = 100;
  if (warningsCount === 1) {
    cheatingRisk = 'Low';
    integrityScore = 95;
  } else if (warningsCount === 2) {
    cheatingRisk = 'Medium';
    integrityScore = 85;
  } else if (warningsCount === 3) {
    cheatingRisk = 'Medium';
    integrityScore = 70;
  } else if (warningsCount === 4) {
    cheatingRisk = 'High';
    integrityScore = 55;
  } else if (warningsCount >= 5) {
    cheatingRisk = 'Critical';
    integrityScore = 20;
  }

  const newReport = {
    id: `int-report-${Date.now()}`,
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    roleTitle: selected.title,
    date: new Date().toISOString(),
    duration: durationSeconds,
    overallScore,
    technicalScore: Math.min(100, overallScore + 5),
    behavioralScore: Math.max(0, overallScore - 5),
    presenceScore,
    integrityScore,
    warningsCount,
    cheatingRisk,
    feedback: `Gemini AI Evaluation — Score: ${overallScore}%. Integrity Score: ${integrityScore}% (${cheatingRisk} risk).`,
    qaList: evaluatedQaList
  };

  try {
    await db.execute(
      'INSERT INTO interview_reports (id, user_id, role_title, date, duration, overall_score, technical_score, behavioral_score, presence_score, integrity_score, warnings_count, cheating_risk, feedback) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [newReport.id, req.user.id, newReport.roleTitle, newReport.date, newReport.duration, newReport.overallScore, newReport.technicalScore, newReport.behavioralScore, newReport.presenceScore, newReport.integrityScore, newReport.warningsCount, newReport.cheatingRisk, newReport.feedback]
    );
    for (const qa of evaluatedQaList) {
      await db.execute(
        'INSERT INTO interview_qa (report_id, question, user_answer, score, correctness, technical_knowledge) VALUES (?,?,?,?,?,?)',
        [newReport.id, qa.question, qa.userAnswer || '', qa.score, qa.correctness || '', qa.technicalKnowledge || '']
      );
    }
    // Log submit activity
    const actId = `act-sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await db.execute(
      'INSERT INTO activity_logs (id, user_id, template_id, action, details, timestamp) VALUES (?,?,?,?,?,?)',
      [actId, req.user.id, templateId, 'submitted', `Interview submitted. Integrity: ${integrityScore}%.`, Date.now()]
    );
    // Update user readiness score
    await db.execute('UPDATE users SET readiness_score=? WHERE id=?', [newReport.overallScore, req.user.id]);
  } catch (dbErr) {
    console.error('[submitInterview DB error]', dbErr.message);
  }

  res.status(201).json(newReport);
};

// Aptitude endpoints
const getAptitude = (req, res) => {
  const questions = readData(APTITUDE_FILE, defaultAptitudeQuestions);
  if (!questions || questions.length === 0) {
    writeData(APTITUDE_FILE, defaultAptitudeQuestions);
    return res.json(defaultAptitudeQuestions);
  }
  res.json(questions);
};

const getAptitudeHistory = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM aptitude_results WHERE user_id=? ORDER BY date DESC',
      [req.user.id]
    );
    res.json(rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      date: r.date,
      percentage: r.percentage,
      correctAnswers: r.correct_answers,
      totalQuestions: r.total_questions,
      duration: r.duration,
      details: (() => {
        try { return JSON.parse(r.details || '[]'); } catch { return []; }
      })()
    })));
  } catch (err) {
    console.error('[getAptitudeHistory error]', err.message);
    res.status(500).json({ error: 'Failed to fetch aptitude history' });
  }
};

const submitAptitude = async (req, res) => {
  const { id, date, percentage, correctAnswers, totalQuestions, duration, details } = req.body;
  const resultId = id || `apt-${Date.now()}`;
  const detailsJson = JSON.stringify(Array.isArray(details) ? details : []);
  try {
    await db.execute(
      'INSERT INTO aptitude_results (id, user_id, date, percentage, correct_answers, total_questions, duration, details) VALUES (?,?,?,?,?,?,?,?)',
      [resultId, req.user.id, date || new Date().toISOString(), percentage || 0, correctAnswers || 0, totalQuestions || 0, duration || '0m', detailsJson]
    );
    // Update user aptitude score
    await db.execute('UPDATE users SET aptitude_score=? WHERE id=?', [percentage || 0, req.user.id]);
  } catch (dbErr) {
    console.error('[submitAptitude DB error]', dbErr.message);
  }
  res.status(201).json({ id: resultId, userId: req.user.id, ...req.body });
};

const startSession = async (req, res) => {
  const { templateId } = req.body;
  const logId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  try {
    await db.execute(
      'INSERT INTO activity_logs (id, user_id, template_id, action, details, timestamp) VALUES (?,?,?,?,?,?)',
      [logId, req.user.id, templateId, 'login', 'Interview session initiated, entering lobby.', Date.now()]
    );
  } catch (dbErr) {
    console.error('[startSession DB error]', dbErr.message);
  }
  res.json({ success: true, sessionId: logId });
};

const logWarning = async (req, res) => {
  const { templateId, type, message, warningCount } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const device = req.headers['user-agent'] || 'Unknown Device';
  const warnId = `warn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const actId = `act-warn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const action = type === 'tab' ? 'tab_switched' : type === 'copy' ? 'copy_attempt' : type === 'fullscreen' ? 'fullscreen_exit' : type === 'devtools' ? 'devtools_attempt' : 'suspicious_activity';
  try {
    await db.execute(
      'INSERT INTO warning_logs (id, user_id, template_id, type, message, warning_count, timestamp, ip, device) VALUES (?,?,?,?,?,?,?,?,?)',
      [warnId, req.user.id, templateId, type, message, warningCount, Date.now(), ip, device]
    );
    await db.execute(
      'INSERT INTO activity_logs (id, user_id, template_id, action, details, timestamp) VALUES (?,?,?,?,?,?)',
      [actId, req.user.id, templateId, action, message, Date.now()]
    );
  } catch (dbErr) {
    console.error('[logWarning DB error]', dbErr.message);
  }
  res.json({ success: true });
};

const logActivity = async (req, res) => {
  const { templateId, action, details } = req.body;
  const logId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  try {
    await db.execute(
      'INSERT INTO activity_logs (id, user_id, template_id, action, details, timestamp) VALUES (?,?,?,?,?,?)',
      [logId, req.user.id, templateId, action, details, Date.now()]
    );
  } catch (dbErr) {
    console.error('[logActivity DB error]', dbErr.message);
  }
  res.json({ success: true });
};

const getWarningsList = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM warning_logs ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    console.error('[getWarningsList error]', err.message);
    res.status(500).json({ error: 'Failed to fetch warnings' });
  }
};

const getActivityLogsList = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM activity_logs ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    console.error('[getActivityLogsList error]', err.message);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

module.exports = { 
  getTemplates, 
  getHistory, 
  submitInterview, 
  getAptitude, 
  getAptitudeHistory, 
  submitAptitude,
  startSession,
  logWarning,
  logActivity,
  getWarningsList,
  getActivityLogsList
};
