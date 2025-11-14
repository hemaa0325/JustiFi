import React, { useState, useEffect } from 'react';
import '../styles/NotificationSystem.css';
import { t } from '../utils/localization';
import * as notificationService from '../services/notificationService';
import { getCurrentUser } from '../services/authService';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currentUser, setCurrentUser] = useState(null);

  // Load language from settings
  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLanguage(settings.language || 'en');
    }
  }, []);

  // Get current user
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // Load notifications if user is logged in
    if (user) {
      loadUserNotifications(user.id);
    }
  }, []);

  // Load notifications from API
  const loadUserNotifications = async (userId) => {
    try {
      const userNotifications = await notificationService.getUserNotifications(userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Function to show a notification
  const showNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setVisible(true);

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  // Function to mark a notification as read
  const markAsRead = async (id) => {
    try {
      await notificationService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback to local update if API fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    }
  };

  // Function to dismiss a notification
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Function to clear all notifications
  const clearAll = async () => {
    if (currentUser) {
      try {
        await notificationService.markAllNotificationsAsRead(currentUser.id);
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        // Fallback to local update if API fails
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      }
    }
    setVisible(false);
  };

  // Function to format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return t('just_now', language);
    if (diffInMinutes < 60) return t('minutes_ago', language).replace('{minutes}', diffInMinutes);
    if (diffInMinutes < 1440) return t('hours_ago', language).replace('{hours}', Math.floor(diffInMinutes / 60));
    return t('days_ago', language).replace('{days}', Math.floor(diffInMinutes / 1440));
  };

  // Poll for new notifications
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        loadUserNotifications(currentUser.id);
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Show banner when there are unread notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      setVisible(true);
      
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Get the most recent unread notification to display in banner
  const getLatestUnreadNotification = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      return unreadNotifications[0];
    }
    return null;
  };

  const latestNotification = getLatestUnreadNotification();

  return (
    <div className="notification-system">
      {visible && latestNotification && (
        <div className="notification-banner">
          <div className="notification-content">
            <div className={`notification-icon notification-icon-${latestNotification.type}`}>
              {latestNotification.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
              {latestNotification.type === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" x2="12" y1="9" y2="13"></line>
                  <line x1="12" x2="12.01" y1="17" y2="17"></line>
                </svg>
              )}
              {latestNotification.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" x2="9" y1="9" y2="15"></line>
                  <line x1="9" x2="15" y1="9" y2="15"></line>
                </svg>
              )}
              {latestNotification.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="16" y2="12"></line>
                  <line x1="12" x2="12.01" y1="8" y2="8"></line>
                </svg>
              )}
            </div>
            <div className="notification-text">
              <div className="notification-title">{latestNotification.title}</div>
              <div className="notification-message">{latestNotification.message}</div>
            </div>
            <button 
              className="dismiss-button" 
              onClick={() => dismissNotification(latestNotification.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" x2="6" y1="6" y2="18"></line>
                <line x1="6" x2="18" y1="6" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;