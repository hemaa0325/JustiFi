import React, { useState, useEffect } from 'react';
import '../styles/CreditScoreAnalysis.css';
import { t } from '../utils/localization';

const CreditScoreAnalysis = ({ result, language }) => {
  const { score, explanations, safetyLevel } = result;
  const [animationClass, setAnimationClass] = useState('');

  // Add animation when component mounts
  useEffect(() => {
    setAnimationClass('animate');
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Determine score category and color
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: t('excellent', language), color: 'excellent' };
    if (score >= 60) return { category: t('good', language), color: 'good' };
    if (score >= 40) return { category: t('fair', language), color: 'fair' };
    return { category: t('poor', language), color: 'poor' };
  };

  const { category, color } = getScoreCategory(score);

  // Get safety level label
  const getSafetyLevelLabel = (level) => {
    switch(level) {
      case 'very safe': return t('very_safe', language);
      case 'okay': return t('okay', language);
      case 'unsafe': return t('unsafe', language);
      default: return t('unknown', language);
    }
  };

  // Get safety level color
  const getSafetyLevelColor = (level) => {
    switch(level) {
      case 'very safe': return '#10b981'; // green
      case 'okay': return '#f59e0b'; // amber
      case 'unsafe': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Calculate progress percentage for the circular progress bar
  const progressPercentage = (score / 100) * 100;

  // Get score description based on score range
  const getScoreDescription = (score) => {
    if (score >= 80) return t('excellent_score_description', language);
    if (score >= 60) return t('good_score_description', language);
    if (score >= 40) return t('fair_score_description', language);
    return t('poor_score_description', language);
  };

  const scoreDescription = getScoreDescription(score);

  // Function to copy score to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${score}/100 - ${category} - ${getSafetyLevelLabel(safetyLevel)}`);
    // You could add a toast notification here
  };

  // Get score thresholds for visualization
  const getScoreThresholds = () => {
    return [
      { label: t('poor', language), value: 40, color: '#ff4d4d' },
      { label: t('fair', language), value: 60, color: '#ff9900' },
      { label: t('good', language), value: 80, color: '#33cc33' },
      { label: t('excellent', language), value: 100, color: '#0066cc' }
    ];
  };

  return (
    <div className="credit-score-analysis">
      <div className="score-header">
        <h2>{t('credit_score_analysis', language)}</h2>
        <p className="analysis-date">{t('analysis_generated_on', language)} {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="score-display-container">
        <div className="score-visualization">
          <div className="circular-progress">
            <svg className="progress-ring" width="180" height="180">
              <circle 
                className="progress-ring-background" 
                stroke="#e6e6e6" 
                strokeWidth="12" 
                fill="transparent" 
                r="70" 
                cx="90" 
                cy="90"
              />
              <circle 
                className={`progress-ring-progress ${color}`} 
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercentage / 100)}`}
                strokeWidth="12" 
                fill="transparent" 
                r="70" 
                cx="90" 
                cy="90"
                transform="rotate(-90 90 90)"
                style={{ '--stroke-dashoffset': `${2 * Math.PI * 70 * (1 - progressPercentage / 100)}` }}
              />
            </svg>
            <div className="score-content">
              <span className={`score-value ${color}`}>{score}</span>
              <span className="score-max">/100</span>
              <div className="score-category">{category}</div>
              <div className="safety-level" style={{ color: getSafetyLevelColor(safetyLevel) }}>
                {getSafetyLevelLabel(safetyLevel)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="score-details">
          <div className="score-description">
            <p>{scoreDescription}</p>
          </div>
          <div className="score-thresholds">
            <h4>{t('score_thresholds', language) || 'Score Thresholds'}</h4>
            <div className="thresholds-container">
              {getScoreThresholds().map((threshold, index) => (
                <div key={index} className="threshold-item">
                  <div 
                    className="threshold-bar"
                    style={{ 
                      width: `${threshold.value}%`,
                      backgroundColor: threshold.color,
                      opacity: score >= threshold.value ? 1 : 0.3
                    }}
                  ></div>
                  <span className="threshold-label">{threshold.label}</span>
                  <span className="threshold-value">{threshold.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="score-info">
            <div className="info-item">
              <span className="info-label">{t('score_range', language)}</span>
              <span className="info-value">0-100</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('safety_level', language)}</span>
              <span className="info-value" style={{ color: getSafetyLevelColor(safetyLevel) }}>
                {getSafetyLevelLabel(safetyLevel)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('next_review', language)}</span>
              <span className="info-value">{t('days_30', language)}</span>
            </div>
          </div>
          <button className="copy-score-btn" onClick={copyToClipboard}>
            {t('copy_score', language)}
          </button>
        </div>
      </div>
      
      <div className="detailed-analysis">
        <h3>{t('detailed_analysis', language)}</h3>
        {explanations && explanations.length > 0 ? (
          <div className="explanations-list">
            {explanations.map((explanation, index) => (
              <div key={index} className="explanation-item">
                <div className="explanation-header">
                  <span className={`explanation-factor ${explanation.points >= 0 ? 'positive' : 'negative'}`}>
                    {explanation.factor.replace(/_/g, ' ')}
                  </span>
                  <span className={`explanation-points ${explanation.points >= 0 ? 'positive' : 'negative'}`}>
                    {explanation.points >= 0 ? `+${explanation.points}` : explanation.points}
                  </span>
                </div>
                <p className="explanation-text">{explanation.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-explanations">{t('no_detailed_analysis_available', language)}</p>
        )}
      </div>
      
      <div className="recommendations">
        <h3>{t('recommendations', language)}</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="recommendation-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h4>{t('maintain_regular_transactions', language)}</h4>
            <p>{t('maintain_regular_transactions_desc', language)}</p>
          </div>
          <div className="recommendation-card">
            <div className="recommendation-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"></path>
              </svg>
            </div>
            <h4>{t('reduce_refunds_and_returns', language)}</h4>
            <p>{t('reduce_refunds_and_returns_desc', language)}</p>
          </div>
          <div className="recommendation-card">
            <div className="recommendation-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h4>{t('build_consistent_spending_pattern', language)}</h4>
            <p>{t('build_consistent_spending_pattern_desc', language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreAnalysis;