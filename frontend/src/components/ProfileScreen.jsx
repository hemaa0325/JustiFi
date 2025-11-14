import React, { useState, useEffect } from 'react';
import '../styles/ProfileScreen.css';
import { t } from '../utils/localization';
import * as userService from '../services/userService';

const ProfileScreen = ({ 
  profile: initialProfile, 
  onEdit, 
  onLogout, 
  onBack, 
  language, 
  onViewLoanHistory,
  onViewSpendingPatterns,
  onViewSettings,
  onUploadDocument,
  userId
}) => {
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

  const [userLoanRequests, setUserLoanRequests] = useState([]);
  const [loadingLoanRequests, setLoadingLoanRequests] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserLoanRequests();
    }
  }, [userId]);

  const fetchUserLoanRequests = async () => {
    setLoadingLoanRequests(true);
    try {
      const loanRequests = await userService.getUserLoanRequests(userId);
      setUserLoanRequests(loanRequests);
    } catch (error) {
      console.error('Error fetching user loan requests:', error);
    } finally {
      setLoadingLoanRequests(false);
    }
  };

  const getLatestPendingLoanRequest = () => {
    if (userLoanRequests.length > 0) {
      // Filter for pending, approved, or rejected requests (not disbursed)
      const activeRequests = userLoanRequests.filter(lr => 
        lr.status === 'pending' || lr.status === 'approved' || lr.status === 'rejected'
      );
      
      if (activeRequests.length > 0) {
        // Sort by created_at to get the most recent
        const sortedRequests = [...activeRequests].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        return sortedRequests[0];
      }
    }
    return null;
  };

  const latestLoanRequest = getLatestPendingLoanRequest();

  useEffect(() => {
    // Load profile data from API
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await userService.getUserProfile(userId);
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
        const saved = localStorage.getItem('user');
        if (saved) {
          const user = JSON.parse(saved);
          const profileData = {
            name: user.fullName || user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            occupation: user.occupation || ''
          };
          setProfile(profileData);
          setSavedProfile(profileData);
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
      
      const response = await userService.updateUserProfile(userId, profileData);
      
      // Update the saved profile with the response from the server
      const updatedProfile = {
        name: response.user.fullName || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        address: response.user.address || '',
        occupation: response.user.occupation || ''
      };
      
      setSavedProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Keep current profile data if API fails
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
    // Check if user has an active loan request
    if (latestLoanRequest) {
      const confirmUpload = window.confirm(
        `${t('existing_loan_request_warning', language)}\n` +
        `${t('loan_status', language)}: ${t(latestLoanRequest.status, language)}\n` +
        `${t('requested_amount', language)}: ₹${latestLoanRequest.amount?.toLocaleString()}\n\n` +
        `${t('continue_anyway', language)}`
      );
      
      if (!confirmUpload) {
        return;
      }
    }
    
    if (onUploadDocument) {
      onUploadDocument();
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
        <div className="card">
          <div className="header">
            <button className="back-button btn btn-secondary" onClick={onBack}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
            </button>
            <h1 className="page-title">{t('profile', language)}</h1>
          </div>
          <div className="profile-card">
            <div className="loading">{t('loading', language)}...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="profile-screen">
        <div className="card">
        <div className="header">
          <button className="back-button btn btn-secondary" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>
          <h1 className="page-title">{t('profile', language)}</h1>
        </div>
        <div className="profile-card">
          {!isEditing ? (
            <div className="profile-view">
              <div className="profile-header">
                <div className="avatar">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
                <h2 className="user-name">{profile.name || t('user', language)}</h2>
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
              
              <div className="loan-info-section">
                <h3 className="section-title">{t('loan_information', language)}</h3>
                
                {loadingLoanRequests ? (
                  <p>{t('loading', language)}...</p>
                ) : latestLoanRequest ? (
                  <div className="loan-status-info">
                    <p>{t('existing_loan_request', language)}</p>
                    <div className="loan-status-badge">
                      <span className={`status ${latestLoanRequest.status}`}>
                        {t(latestLoanRequest.status, language)}
                      </span>
                    </div>
                    <p className="loan-amount">
                      {t('amount', language)}: ₹{latestLoanRequest.amount?.toLocaleString()}
                    </p>
                    <p className="loan-date">
                      {t('requested_on', language)}: {new Date(latestLoanRequest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p>{t('submit_documents_for_assessment', language)}</p>
                )}
                
                <button 
                  className="btn btn-primary" 
                  onClick={handleUploadDocument}
                  disabled={loadingLoanRequests}
                >
                  {t('upload_documents', language)}
                </button>
              </div>

              <div className="profile-actions">
                <button className="edit-button btn btn-primary" onClick={handleEdit}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                  {t('edit_profile', language)}
                </button>
                <button className="notifications-button btn btn-primary" onClick={handleViewNotifications}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {t('view_notifications', language)}
                  {unreadNotifications > 0 && (
                    <span className="badge">{unreadNotifications}</span>
                  )}
                </button>
                <button className="history-button btn btn-secondary" onClick={onViewLoanHistory}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  {t('view_loan_history', language)}
                </button>
                <button className="patterns-button btn btn-secondary" onClick={onViewSpendingPatterns}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                  {t('view_spending_patterns', language)}
                </button>
                <button className="settings-button btn btn-secondary" onClick={onViewSettings}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="m18 12 4-4-4-4"/>
                    <path d="m6 12-4 4 4 4"/>
                    <path d="M12 18h6"/>
                    <path d="M12 6H6"/>
                  </svg>
                  {t('settings', language)}
                </button>
                <button className="logout-button btn btn-secondary" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" x2="9" y1="12" y2="12"/>
                  </svg>
                  {t('logout', language)}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-edit">
              <div className="form-group">
                <label className="label">{t('full_name', language)}</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="label">{t('email', language)}</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="label">{t('phone', language)}</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="label">{t('address', language)}</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="label">{t('occupation', language)}</label>
                <input
                  type="text"
                  name="occupation"
                  value={profile.occupation}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              
              <div className="edit-actions">
                <button className="save-button btn btn-primary" onClick={handleSave}>
                  {t('save', language)}
                </button>
                <button className="cancel-button btn btn-secondary" onClick={handleCancel}>
                  {t('cancel', language)}
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;