import React, { useState, useEffect } from 'react';
import '../styles/ProfileScreen.css';
import { t } from '../utils/localization';
import { getUserProfile, updateUserProfile, logout } from '../services/authService';

const ProfileScreen = ({ onBack, userId, onViewLoanHistory, onViewSpendingPatterns, onViewSettings, language, onUploadDocument, onViewNotifications }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occupation: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load profile data from API
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await getUserProfile(userId);
        const profileData = {
          name: userProfile.fullName || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          occupation: userProfile.occupation || ''
        };
        setProfile(profileData);
        setSavedProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          setProfile(JSON.parse(saved));
          setSavedProfile(JSON.parse(saved));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
    // Load unread notifications count
    const notifications = localStorage.getItem('notifications');
    if (notifications) {
      const parsedNotifications = JSON.parse(notifications);
      const unreadCount = parsedNotifications.filter(n => !n.read).length;
      setUnreadNotifications(unreadCount);
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const profileData = {
        fullName: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        occupation: profile.occupation
      };
      
      await updateUserProfile(userId, profileData);
      
      // Save to localStorage as fallback
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setSavedProfile(profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Fallback to localStorage if API fails
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setSavedProfile(profile);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (savedProfile) {
      setProfile(savedProfile);
    }
    setIsEditing(false);
  };

  const handleUploadDocument = () => {
    // Redirect to upload screen
    if (onUploadDocument) {
      onUploadDocument();
    } else {
      // Fallback to URL navigation
      window.location.hash = '#/upload';
    }
  };

  const handleViewNotifications = () => {
    // Redirect to notifications screen
    if (onViewNotifications) {
      onViewNotifications();
    } else {
      // Show notification modal or alert
      alert(t('notifications_feature_coming_soon', language));
    }
  };

  const handleLogout = () => {
    // Clear user data
    logout();
    // Redirect to onboarding screen by calling onBack which should take us to the previous screen
    // If onBack is not provided, we'll use window.location to redirect
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '#/onboarding';
    }
  };

  if (loading) {
    return (
      <div className="profile-screen">
        <div className="header">
          <button className="back-button" onClick={onBack}>←</button>
          <h1>{t('profile', language)}</h1>
        </div>
        <div className="profile-card">
          <div className="loading">{t('loading', language)}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-screen">
      <div className="header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>{t('profile', language)}</h1>
      </div>
      <div className="profile-card">
        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-header">
              <div className="avatar">{profile.name ? profile.name.charAt(0) : t('user_initial', language)}</div>
              <h2>{profile.name || t('user', language)}</h2>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <span className="label">{t('email', language)}:</span>
                <span className="value">{profile.email || t('not_provided', language)}</span>
              </div>
              <div className="detail-row">
                <span className="label">{t('phone', language)}:</span>
                <span className="value">{profile.phone || t('not_provided', language)}</span>
              </div>
              <div className="detail-row">
                <span className="label">{t('address', language)}:</span>
                <span className="value">{profile.address || t('not_provided', language)}</span>
              </div>
              <div className="detail-row">
                <span className="label">{t('occupation', language)}:</span>
                <span className="value">{profile.occupation || t('not_provided', language)}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="edit-button" onClick={handleEdit}>
                {t('edit_profile', language)}
              </button>
              <button className="upload-button" onClick={handleUploadDocument}>
                {t('upload_document', language)}
              </button>
              <button className="notifications-button" onClick={handleViewNotifications}>
                {t('view_notifications', language)}
                {unreadNotifications > 0 && (
                  <span className="badge">{unreadNotifications}</span>
                )}
              </button>
              <button className="history-button" onClick={onViewLoanHistory}>
                {t('view_loan_history', language)}
              </button>
              <button className="patterns-button" onClick={onViewSpendingPatterns}>
                {t('view_spending_patterns', language)}
              </button>
              <button className="settings-button" onClick={onViewSettings}>
                {t('app_settings', language)}
              </button>
              <button className="logout-button" onClick={handleLogout}>
                {t('logout', language)}
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-edit">
            <div className="form-group">
              <label htmlFor="name">{t('full_name', language)}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder={t('enter_full_name', language)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email', language)}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder={t('enter_email', language)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('phone', language)}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder={t('enter_phone_number', language)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">{t('address', language)}</label>
                <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder={t('enter_address', language)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="occupation">{t('occupation', language)}</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={profile.occupation}
                onChange={handleChange}
                placeholder={t('enter_occupation', language)}
              />
            </div>

            <div className="form-actions">
              <button className="cancel-button" onClick={handleCancel} disabled={loading}>
                {t('cancel', language)}
              </button>
              <button className="save-button" onClick={handleSave} disabled={loading}>
                {loading ? t('processing', language) : t('save_changes', language)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;