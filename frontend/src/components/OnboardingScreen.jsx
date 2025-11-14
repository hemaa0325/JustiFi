import React from 'react';
import '../styles/OnboardingScreen.css';
import { t } from '../utils/localization';

const OnboardingScreen = ({ onStart, language }) => {
  return (
    <div className="onboarding-screen">
      <div className="logo-container">
        <div className="logo">
          <h1>{t('justifi', language)}</h1>
        </div>
        <p className="subtitle">{t('instant_micro_loans', language)}</p>
      </div>
      
      <div className="features">
        <div className="feature">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="feature-content">
            <h3>{t('get_approved', language)}</h3>
            <p>{t('decision_time', language)}</p>
          </div>
        </div>
        
        <div className="feature">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </div>
          <div className="feature-content">
            <h3>{t('no_pan_required', language)}</h3>
            <p>{t('no_pan_aadhaar_required', language)}</p>
          </div>
        </div>
        
        <div className="feature">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="feature-content">
            <h3>{t('loan_amount', language)}</h3>
            <p>{t('data_protected', language)}</p>
          </div>
        </div>
      </div>
      
      <button className="primary-button btn btn-primary" onClick={onStart}>
        {t('get_started', language)}
      </button>
      
      <p className="consent">
        {t('terms_consent', language)}
      </p>
    </div>
  );
};

export default OnboardingScreen;