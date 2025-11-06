import React, { useState, useEffect } from 'react';
import '../styles/NotificationSystem.css';
import { t } from '../utils/localization';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState('en');

  // Load language from settings
  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLanguage(settings.language || 'en');
    }
  }, []);

  // Load notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

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
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Function to dismiss a notification
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Function to clear all notifications
  const clearAll = () => {
    setNotifications([]);
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

  // Simulate loan status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate notifications for demo purposes
      if (Math.random() > 0.7) {
        const loanUpdates = [
          { title: t('loan_approved', language), message: t('loan_application_approved', language).replace('{amount}', '₹5,000'), type: 'success' },
          { title: t('payment_due', language), message: t('payment_due_message', language).replace('{amount}', '₹1,200'), type: 'warning' },
          { title: t('payment_received', language), message: t('payment_received_message', language).replace('{amount}', '₹1,200'), type: 'success' },
          { title: t('loan_disbursed', language), message: t('loan_disbursed_message', language).replace('{amount}', '₹5,000'), type: 'success' }
        ];
        
        const randomUpdate = loanUpdates[Math.floor(Math.random() * loanUpdates.length)];
        showNotification(randomUpdate.title, randomUpdate.message, randomUpdate.type);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="notification-system">
      {visible && notifications.length > 0 && (
        <div className="notification-banner">
          <div className="notification-content">
            <div className="notification-icon">
              {notifications[0].type === 'success' && '✅'}
              {notifications[0].type === 'warning' && '⚠️'}
              {notifications[0].type === 'error' && '❌'}
              {notifications[0].type === 'info' && 'ℹ️'}
            </div>
            <div className="notification-text">
              <div className="notification-title">{notifications[0].title}</div>
              <div className="notification-message">{notifications[0].message}</div>
            </div>
            <button 
              className="dismiss-button" 
              onClick={() => dismissNotification(notifications[0].id)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;