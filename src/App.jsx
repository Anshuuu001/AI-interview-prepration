import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import EditProfile from './pages/Profile/EditProfile';
import InterviewDashboard from './pages/MockInterview/InterviewDashboard';
import VideoInterviewDashboard from './pages/MockInterview/VideoInterviewDashboard';
import InterviewRoom from './pages/MockInterview/InterviewRoom';
import PerformanceReport from './pages/MockInterview/PerformanceReport';
import AptitudeTest from './pages/Aptitude/AptitudeTest';
import TestResult from './pages/Aptitude/TestResult';
import AIChatBot from './pages/CareerAssistant/AIChatBot';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageQuestions from './pages/Admin/ManageQuestions';
import Analytics from './pages/Analytics/Analytics';
import CodingPractice from './pages/CodingPractice/CodingPractice';
import LandingPage from './pages/LandingPage';
import SuspendedPage from './pages/SuspendedPage';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Loader from './components/Loader';

// Protected Route Wrapper
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying security credentials..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check suspension status specific to this user account
  const blockUntilStr = localStorage.getItem(`proctoring_block_until_${user.id}`);
  if (blockUntilStr) {
    const blockUntil = parseInt(blockUntilStr, 10);
    if (Date.now() < blockUntil) {
      return <Navigate to="/suspended" replace />;
    } else {
      localStorage.removeItem(`proctoring_block_until_${user.id}`);
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Main Layout Wrapper
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      // 15 minutes = 15 * 60 * 1000 ms
      inactivityTimer = setTimeout(() => {
        logout();
        alert('You have been logged out due to inactivity.');
        navigate('/login');
      }, 15 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logout, navigate]);

  return (
    <div className="h-screen flex relative overflow-hidden font-sans"
      style={{ background: 'var(--app-bg)', backgroundColor: 'var(--app-bg-color)' }}>
      {/* Aurora background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] animate-morph animate-float-slow"
          style={{ background: `radial-gradient(circle, var(--orb-1) 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] animate-morph-slow animate-float-slower"
          style={{ background: `radial-gradient(circle, var(--orb-2) 0%, transparent 70%)`, filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] animate-morph-slower animate-float-drift"
          style={{ background: `radial-gradient(circle, var(--orb-3) 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div className="bg-grid-animated opacity-40 dark:opacity-20" />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative overflow-hidden animate-fade-in-up" style={{ zIndex: 1 }}>
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-16 flex flex-col gap-8">
          <div className="flex-grow max-w-[1440px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/suspended" element={<SuspendedPage />} />

            {/* Protected Candidate Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<EditProfile />} />
                <Route path="/interview" element={<InterviewDashboard />} />
                <Route path="/video-interview" element={<VideoInterviewDashboard />} />
                <Route path="/interview/room/:id" element={<InterviewRoom />} />
                <Route path="/interview/report/:id" element={<PerformanceReport />} />
                <Route path="/aptitude" element={<AptitudeTest />} />
                <Route path="/aptitude/result/:id" element={<TestResult />} />
                <Route path="/chat" element={<AIChatBot />} />
                <Route path="/practice" element={<CodingPractice />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route element={<DashboardLayout />}>
                <Route path="/admin/questions" element={<ManageQuestions />} />
              </Route>
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
