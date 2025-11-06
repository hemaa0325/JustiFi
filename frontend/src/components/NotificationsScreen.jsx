import React, { useState, useEffect } from 'react';
import '../styles/NotificationsScreen.css';
import { t } from '../utils/localization';

const NotificationsScreen = ({ onBack, language }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Create some sample notifications if none exist
      const sampleNotifications = [
        {
          id: 1,
          title: t('loan_approved', language),
          message: t('loan_application_approved', language).replace('{amount}', '₹5,000'),
          time: '2 hours ago',
          read: false
        },
        {
          id: 2,
          title: t('payment_due', language),
          message: t('payment_due_message', language).replace('{amount}', '₹2,500'),
          time: '1 day ago',
          read: true
        },
        {
          id: 3,
          title: t('payment_received', language),
          message: t('payment_received_message', language).replace('{amount}', '₹3,000'),
          time: '3 days ago',
          read: true
        },
        {
          id: 4,
          title: t('loan_disbursed', language),
          message: t('loan_disbursed_message', language).replace('{amount}', '₹7,500'),
          time: '1 week ago',
          read: true
        }
      ];
      setNotifications(sampleNotifications);
      localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    }
  }, [language]);

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const formatTime = (timeString) => {
    // This is a simple implementation - in a real app, you would calculate the actual time difference
    return timeString;
  };

  return (
    <div className="notifications-screen">
      <div className="header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>{t('notifications', language)}</h1>
        {notifications.some(n => !n.read) && (
          <button className="mark-all-button" onClick={markAllAsRead}>
            {t('mark_all_as_read', language)}
          </button>
        )}
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>{t('no_notifications', language)}</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <div className="notification-footer">
                  <span className="time">{formatTime(notification.time)}</span>
                  {!notification.read && (
                    <span className="unread-badge">{t('unread', language)}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;