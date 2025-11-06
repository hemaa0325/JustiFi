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
          <div className="feature-icon">⏱️</div>
          <div className="feature-content">
            <h3>{t('get_approved', language)}</h3>
            <p>{t('decision_time', language)}</p>
          </div>
        </div>
        
        <div className="feature">
          <div className="feature-icon">📋</div>
          <div className="feature-content">
            <h3>{t('no_pan_required', language)}</h3>
            <p>{t('no_pan_aadhaar_required', language)}</p>
          </div>
        </div>
        
        <div className="feature">
          <div className="feature-icon">💰</div>
          <div className="feature-content">
            <h3>{t('loan_amount', language)}</h3>
            <p>{t('data_protected', language)}</p>
          </div>
        </div>
      </div>
      
      <button className="primary-button" onClick={onStart}>
        {t('get_started', language)}
      </button>
      
      <p className="consent">
        {t('terms_consent', language)}
      </p>
    </div>
  );
};

export default OnboardingScreen;