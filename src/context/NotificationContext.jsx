import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import interviewService from '../services/interviewService';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist readIds to localStorage
  useEffect(() => {
    localStorage.setItem('read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  // Load notifications from history when user changes
  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      // Fetch both interview and aptitude histories concurrently
      const [interviews, aptitudes] = await Promise.all([
        interviewService.getPastInterviews().catch(() => []),
        interviewService.getTestResults().catch(() => [])
      ]);

      const list = [];

      // 1. Convert completed interviews to notifications
      if (Array.isArray(interviews)) {
        interviews.forEach(item => {
          list.push({
            id: `int-${item.id}`,
            title: 'Mock Interview Graded',
            message: `You scored ${item.overallScore}% in your ${item.roleTitle} interview.`,
            date: item.date,
            link: `/interview/report/${item.id}`,
            type: 'interview'
          });
        });
      }

      // 2. Convert completed aptitude tests to notifications
      if (Array.isArray(aptitudes)) {
        aptitudes.forEach(item => {
          list.push({
            id: `apt-${item.id}`,
            title: 'Aptitude Test Graded',
            message: `You scored ${item.percentage}% in ${item.category === 'All' ? 'All Subjects' : item.category} quiz.`,
            date: item.date,
            link: `/aptitude/result/${item.id}`,
            type: 'aptitude'
          });
        });
      }

      // Sort notifications by date descending
      list.sort((a, b) => new Date(b.date) - new Date(a.date));

      // 3. Fallback Welcome notification if list is empty
      if (list.length === 0) {
        list.push({
          id: 'welcome',
          title: 'Welcome to ElevateAI!',
          message: 'Your AI interview assistant is ready. Start your first Mock Interview or Aptitude Test today.',
          date: new Date().toISOString(),
          link: '/dashboard',
          type: 'system'
        });
      }

      setNotifications(list);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const markAsRead = (id) => {
    setReadIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
  };

  const addNotification = ({ title, message, type, link }) => {
    const newNotif = {
      id: `live-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      link: link || '/dashboard',
      type: type || 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Compute unread count
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      readIds,
      markAsRead,
      markAllAsRead,
      addNotification,
      refreshNotifications: loadNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
