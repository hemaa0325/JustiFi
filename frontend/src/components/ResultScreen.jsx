import React, { useState, useEffect } from 'react';
import '../styles/ResultScreen.css';
import { t } from '../utils/localization';

const ResultScreen = ({ result, onRestart, onViewProfile, onViewLoanHistory, onViewSpendingPatterns, onViewSettings, language }) => {
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [disbursementResult, setDisbursementResult] = useState(null);

  if (!result) {
    return <div>{t('loading', language)}...</div>;
  }

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVE': return '#28a745';
      case 'APPROVE_WITH_CAP': return '#ffc107';
      case 'REVIEW': return '#17a2b8';
      case 'REJECT': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getDecisionText = (decision, lang) => {
    switch (decision) {
      case 'APPROVE': return t('approved', lang);
      case 'APPROVE_WITH_CAP': return t('approved_with_cap', lang);
      case 'REVIEW': return t('under_review', lang);
      case 'REJECT': return t('rejected', lang);
      default: return t('pending', lang);
    }
  };

  const handleDisburseLoan = async () => {
    setIsDisbursing(true);
    
    try {
      // In a real implementation, we would send the actual user ID
      // For this demo, we'll use a mock user ID
      const response = await fetch('http://localhost:5000/api/disburse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'user-1', // This would be the actual user ID in a real app
          loanAmount: result.loanAmount
        })
      });

      const disbursementData = await response.json();
      
      if (response.ok) {
        setDisbursementResult({
          success: true,
          message: t('loan_disbursed_success', language).replace('{amount}', result.loanAmount.toLocaleString()),
          data: disbursementData
        });
      } else {
        setDisbursementResult({
          success: false,
          message: disbursementData.error || t('failed_to_disburse_loan', language)
        });
      }
    } catch (error) {
      console.error('Error disbursing loan:', error);
      setDisbursementResult({
        success: false,
        message: t('error_processing_request', language)
      });
    } finally {
      setIsDisbursing(false);
    }
  };

  return (
    <div className="result-screen">
      <div className="header">
        <button className="back-button" onClick={onRestart}>←</button>
        <h1>{t('assessment_result', language)}</h1>
      </div>
      <div className="score-card">
        <div className="score-header">
          <h2>{t('trust_score', language)}</h2>
          <div 
            className="decision-badge" 
            style={{ backgroundColor: getDecisionColor(result.decision) }}
          >
            {getDecisionText(result.decision, language)}
          </div>
        </div>
        
        <div className="score-display">
          <span className="score">{result.score}</span>
          <span className="score-max">/{t('hundred', language)}</span>
        </div>
        
        <p className="score-message">{result.message}</p>
      </div>

      <div className="reasons-section">
        <h3>{t('top_reasons', language)}</h3>
        <ul className="reasons-list">
          {result.reasons.map((reason, index) => (
            <li key={index} className="reason-item">{t(reason, language) || reason}</li>
          ))}
        </ul>
      </div>

      {result.decision !== 'REJECT' && result.decision !== 'REVIEW' && !disbursementResult && (
        <div className="loan-offer">
          <h3>{t('loan_offer', language)}</h3>
          <div className="loan-amount">₹{result.loanAmount.toLocaleString()}</div>
          <p className="loan-details">{t('available_for_disbursement', language)}</p>
          
          <button 
            className="disburse-button" 
            onClick={handleDisburseLoan}
            disabled={isDisbursing}
          >
            {isDisbursing ? t('processing', language) : t('accept_loan', language)}
          </button>
        </div>
      )}

      {disbursementResult && (
        <div className="loan-offer">
          <h3>{disbursementResult.success ? t('loan_approved', language) : t('error', language)}</h3>
          <p className={disbursementResult.success ? 'success-message' : 'error-message'}>
            {disbursementResult.message}
          </p>
          {disbursementResult.success && (
            <div className="success-details">
              <p>{t('transaction_id', language)}: {disbursementResult.data.transaction.id}</p>
              <p>{t('amount', language)}: ₹{disbursementResult.data.transaction.amount.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      <div className="actions">
        <button className="secondary-button" onClick={onViewProfile}>
          {t('view_profile', language)}
        </button>
        <button className="secondary-button" onClick={onViewLoanHistory}>
          {t('loan_history', language)}
        </button>
        <button className="secondary-button" onClick={onViewSpendingPatterns}>
          {t('spending_patterns', language)}
        </button>
        <button className="secondary-button" onClick={onViewSettings}>
          {t('settings', language)}
        </button>
        <button className="secondary-button" onClick={onRestart}>
          {t('assess_another_person', language)}
        </button>
      </div>

      <div className="privacy-footer">
        <p>🔒 {t('data_protected', language)}</p>
      </div>
    </div>
  );
};

export default ResultScreen;