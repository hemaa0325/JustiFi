import React, { useState, useEffect } from 'react';
import '../styles/SettingsScreen.css';
import { t } from '../utils/localization';

const SettingsScreen = ({ onBack, language }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'en',
    currency: 'INR'
    // Removed viewMode since we're keeping only mobile view
  });
  const [savedSettings, setSavedSettings] = useState(null);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      // Remove viewMode from loaded settings
      const { viewMode, ...filteredSettings } = parsedSettings;
      setSettings(filteredSettings);
      setSavedSettings(filteredSettings);
    }
  }, []);

  const handleChange = (name, value) => {
    const newSettings = {
      ...settings,
      [name]: value
    };
    
    // If notifications are disabled, disable email and SMS notifications
    if (name === 'notifications' && !value) {
      newSettings.emailNotifications = false;
      newSettings.smsNotifications = false;
    }
    
    setSettings(newSettings);
    
    // Apply dark mode immediately
    if (name === 'darkMode') {
      if (value) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
    
    // Apply language change immediately
    if (name === 'language') {
      // This will trigger a re-render with the new language
    }
  };

  const handleSave = () => {
    // Save to localStorage (in a real app, this would be an API call)
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSavedSettings(settings);
    setShowSaveMessage(true);
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

  const handleReset = () => {
    const defaultSettings = {
      notifications: true,
      emailNotifications: true,
      smsNotifications: false,
      darkMode: false,
      language: 'en',
      currency: 'INR'
      // No viewMode in default settings
    };
    
    setSettings(defaultSettings);
    setSavedSettings(defaultSettings);
    
    // Apply dark mode immediately
    document.body.classList.remove('dark-mode');
  };

  // Handle toggle switch clicks
  const handleToggle = (name, currentValue) => {
    handleChange(name, !currentValue);
  };

  // Handle select changes
  const handleSelectChange = (name, e) => {
    handleChange(name, e.target.value);
  };

  return (
    <div className="settings-screen">
      <div className="header">
        <button className="back-button btn btn-secondary" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </button>
        <h1 className="page-title">{t('settings', language)}</h1>
      </div>
      <div className="settings-container">
        <div className="settings-card card">
          <h2 className="section-title">{t('notifications', language)}</h2>
          <div className="setting-item">
            <label className="label" htmlFor="notifications">{t('enable_notifications', language)}</label>
            <div className="toggle-switch" onClick={() => handleToggle('notifications', settings.notifications)}>
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </div>

          <div className="setting-item">
            <label className="label" htmlFor="emailNotifications">{t('email_notifications', language)}</label>
            <div className="toggle-switch" onClick={() => settings.notifications && handleToggle('emailNotifications', settings.emailNotifications)}>
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                disabled={!settings.notifications}
              />
              <span className="slider"></span>
            </div>
          </div>

          <div className="setting-item">
            <label className="label" htmlFor="smsNotifications">{t('sms_notifications', language)}</label>
            <div className="toggle-switch" onClick={() => settings.notifications && handleToggle('smsNotifications', settings.smsNotifications)}>
              <input
                type="checkbox"
                id="smsNotifications"
                checked={settings.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                disabled={!settings.notifications}
              />
              <span className="slider"></span>
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <h2 className="section-title">{t('appearance', language)}</h2>
          <div className="setting-item">
            <label className="label" htmlFor="darkMode">{t('dark_mode', language)}</label>
            <div className="toggle-switch" onClick={() => handleToggle('darkMode', settings.darkMode)}>
              <input
                type="checkbox"
                id="darkMode"
                checked={settings.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </div>
          
          {/* Removed viewMode setting since we're keeping only mobile view */}
        </div>

        <div className="settings-card card">
          <h2 className="section-title">{t('preferences', language)}</h2>
          <div className="setting-item">
            <label className="label" htmlFor="language">{t('language', language)}</label>
            <select
              id="language"
              className="input"
              value={settings.language}
              onChange={(e) => handleSelectChange('language', e)}
            >
              <option value="en">{t('english', language)}</option>
              <option value="hi">{t('hindi', language)}</option>
              <option value="ta">{t('tamil', language)}</option>
              <option value="te">{t('telugu', language)}</option>
              <option value="kn">{t('kannada', language)}</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="label" htmlFor="currency">{t('currency', language)}</label>
            <select
              id="currency"
              className="input"
              value={settings.currency}
              onChange={(e) => handleSelectChange('currency', e)}
            >
              <option value="INR">{t('indian_rupee', language)}</option>
              <option value="USD">{t('us_dollar', language)}</option>
              <option value="EUR">{t('euro', language)}</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button className="reset-button btn btn-secondary" onClick={handleReset}>
            {t('reset_to_default', language)}
          </button>
          <button className="save-button btn btn-primary" onClick={handleSave}>
            {t('save_settings', language)}
          </button>
        </div>
        
        {showSaveMessage && (
          <div className="save-message">
            {t('settings_saved_successfully', language)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen;