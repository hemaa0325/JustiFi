import React, { useState, useEffect } from 'react';
import '../styles/CreditScoreAnalysis.css';
import { t } from '../utils/localization';

const CreditScoreAnalysis = ({ score, reasons, language }) => {
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

  // Generate justification text based on reasons
  const generateJustification = (reasons) => {
    if (!reasons || reasons.length === 0) return t('no_data_available', language);
    
    // Count positive and negative points
    const positivePoints = reasons.filter(reason => 
      reason.includes('+') && !reason.includes('+0')
    );
    
    const negativePoints = reasons.filter(reason => 
      (reason.includes('-') && !reason.includes('-0')) || reason.includes('+0')
    );
    
    if (positivePoints.length > 0 && negativePoints.length > 0) {
      return t('your_spending_is_stable_but_savings_are_low', language);
    } else if (positivePoints.length > 0) {
      return t('your_financial_behavior_is_consistent', language);
    } else {
      return t('your_financial_pattern_needs_improvement', language);
    }
  };

  const justification = generateJustification(reasons);

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
    navigator.clipboard.writeText(`${score}/100 - ${category}`);
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
              <span className="info-label">{t('next_review', language)}</span>
              <span className="info-value">{t('days_30', language)}</span>
            </div>
          </div>
          <button className="copy-score-btn" onClick={copyToClipboard}>
            {t('copy_score', language)}
          </button>
        </div>
      </div>
      
      <div className="justification-section">
        <h3>{t('score_justification', language)}</h3>
        <p className="justification-text">{justification}</p>
      </div>
      
      <div className="detailed-analysis">
        <h3>{t('detailed_analysis', language)}</h3>
        <div className="analysis-summary">
          <div className="summary-item positive">
            <span className="summary-count">
              {reasons.filter(reason => reason.includes('+') && !reason.includes('+0')).length}
            </span>
            <span className="summary-label">{t('positive_factors', language)}</span>
          </div>
          <div className="summary-item negative">
            <span className="summary-count">
              {reasons.filter(reason => (reason.includes('-') && !reason.includes('-0')) || reason.includes('+0')).length}
            </span>
            <span className="summary-label">{t('negative_factors', language)}</span>
          </div>
        </div>
        <ul className="reasons-list">
          {reasons.map((reason, index) => (
            <li key={index} className="reason-item">
              <span className={`reason-indicator ${reason.startsWith('+') && !reason.includes('+0') ? 'positive' : 'negative'}`}>
                {reason.startsWith('+') && !reason.includes('+0') ? '✓' : '⚠'}
              </span>
              <span className="reason-text">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="recommendations">
        <h3>{t('recommendations', language)}</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="recommendation-icon">📈</div>
            <h4>{t('maintain_regular_transactions', language)}</h4>
            <p>{t('maintain_regular_transactions_desc', language)}</p>
          </div>
          <div className="recommendation-card">
            <div className="recommendation-icon">🔄</div>
            <h4>{t('reduce_refunds_and_returns', language)}</h4>
            <p>{t('reduce_refunds_and_returns_desc', language)}</p>
          </div>
          <div className="recommendation-card">
            <div className="recommendation-icon">📊</div>
            <h4>{t('build_consistent_spending_pattern', language)}</h4>
            <p>{t('build_consistent_spending_pattern_desc', language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreAnalysis;