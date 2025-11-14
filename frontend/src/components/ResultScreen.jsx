import React, { useState, useEffect } from 'react';
import '../styles/ResultScreen.css';
import { t } from '../utils/localization';
import { getCurrentUser } from '../services/authService';
import * as userService from '../services/userService';

const API_BASE_URL = '/api'; // Use relative path to match backend

const ResultScreen = ({ result, onRestart, onViewProfile, onViewLoanHistory, onViewSpendingPatterns, onViewSettings, language, userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanRequestResult, setLoanRequestResult] = useState(null);
  const [userLoanRequests, setUserLoanRequests] = useState([]);

  useEffect(() => {
    // Fetch user loan requests to show current status
    fetchUserLoanRequests();
  }, []);

  const fetchUserLoanRequests = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const loanRequests = await userService.getUserLoanRequests(currentUser.id);
        setUserLoanRequests(loanRequests);
      }
    } catch (error) {
      console.error('Error fetching user loan requests:', error);
    }
  };

  if (!result) {
    return <div className="loading">{t('loading', language)}...</div>;
  }

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVE': return '#10b981';
      case 'APPROVE_WITH_CAP': return '#f59e0b';
      case 'REVIEW': return '#3b82f6';
      case 'REJECT': return '#ef4444';
      default: return '#64748b';
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

  const handleLoanRequest = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current user and token for authentication
      const currentUser = getCurrentUser();
      const token = localStorage.getItem('token');
      
      if (!currentUser || !token) {
        setLoanRequestResult({
          success: false,
          message: t('user_not_authenticated', language)
        });
        return;
      }
      
      // Submit loan request
      const response = await fetch(`${API_BASE_URL}/assess/user/${currentUser.id}/loan-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          loanAmount: result.loanAmount,
          assessmentId: result.assessmentId
        })
      });

      const loanRequestData = await response.json();
      
      if (response.ok) {
        setLoanRequestResult({
          success: true,
          message: t('loan_request_submitted', language),
          data: loanRequestData
        });
        
        // Refresh loan requests
        fetchUserLoanRequests();
      } else {
        setLoanRequestResult({
          success: false,
          message: loanRequestData.error || t('failed_to_submit_loan_request', language)
        });
      }
    } catch (error) {
      console.error('Error submitting loan request:', error);
      setLoanRequestResult({
        success: false,
        message: t('error_processing_request', language)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the latest loan request status
  const getLatestLoanRequestStatus = () => {
    if (userLoanRequests.length > 0) {
      // Sort by created_at to get the most recent
      const sortedRequests = [...userLoanRequests].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      return sortedRequests[0];
    }
    return null;
  };

  const latestLoanRequest = getLatestLoanRequestStatus();

  return (
    <div className="result-screen">
      <div className="card">
        <div className="header">
          <button className="back-button btn btn-secondary" onClick={onRestart}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>
          <h1 className="page-title">{t('assessment_result', language)}</h1>
        </div>
        <div className="score-card">
          <div className="score-header">
            <h2 className="section-title">{t('trust_score', language)}</h2>
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
          <h3 className="section-title">{t('top_reasons', language)}</h3>
          <ul className="reasons-list">
            {result.explanations && result.explanations.length > 0 ? (
              result.explanations.slice(0, 5).map((explanation, index) => (
                <li key={index} className="reason-item">
                  <div className="reason-content">
                    <span className="reason-text">{explanation.explanation || explanation}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="reason-item">
                <div className="reason-content">
                  <span className="reason-text">{t('no_reasons_available', language)}</span>
                </div>
              </li>
            )}
          </ul>
        </div>

        {result.decision !== 'REJECT' && result.decision !== 'REVIEW' && !loanRequestResult && (
          <div className="loan-offer">
            <h3 className="section-title">{t('loan_offer', language)}</h3>
            <div className="loan-amount">₹{result.loanAmount.toLocaleString()}</div>
            <p className="loan-details">{t('available_for_disbursement', language)}</p>
            
            <button 
              className="disburse-button btn btn-primary" 
              onClick={handleLoanRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('processing', language) : t('accept_loan', language)}
            </button>
          </div>
        )}

        {loanRequestResult && (
          <div className="loan-offer">
            <h3 className="section-title">{loanRequestResult.success ? t('loan_request_submitted', language) : t('error', language)}</h3>
            <p className={loanRequestResult.success ? 'success-message' : 'error-message'}>
              {loanRequestResult.message}
            </p>
            {loanRequestResult.success && (
              <div className="success-details">
                <p>{t('loan_status_pending_approval', language)}</p>
                <p>{t('amount', language)}: ₹{result.loanAmount.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Show loan status if there's a loan request */}
        {latestLoanRequest && (
          <div className="loan-status-section">
            <h3 className="section-title">{t('loan_status', language)}</h3>
            <div className="loan-status-content">
              {latestLoanRequest.status === 'pending' && (
                <p className="status-pending">{t('loan_status_pending_approval', language)}</p>
              )}
              {latestLoanRequest.status === 'approved' && (
                <p className="status-approved">{t('loan_approved', language)}</p>
              )}
              {latestLoanRequest.status === 'rejected' && (
                <p className="status-rejected">{t('loan_request_rejected', language)}</p>
              )}
              {latestLoanRequest.status === 'disbursed' && (
                <p className="status-disbursed">{t('loan_disbursed_success', language).replace('{amount}', result.loanAmount.toLocaleString())}</p>
              )}
              <div className="loan-details">
                <p><strong>{t('request_id', language)}:</strong> {latestLoanRequest.id}</p>
                <p><strong>{t('requested_amount', language)}:</strong> ₹{latestLoanRequest.amount?.toLocaleString()}</p>
                <p><strong>{t('requested_on', language)}:</strong> {new Date(latestLoanRequest.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="actions">
          <button className="secondary-button btn btn-secondary" onClick={onViewProfile}>
            {t('view_profile', language)}
          </button>
          <button className="secondary-button btn btn-secondary" onClick={onViewLoanHistory}>
            {t('loan_history', language)}
          </button>
          <button className="secondary-button btn btn-secondary" onClick={onViewSpendingPatterns}>
            {t('spending_patterns', language)}
          </button>
          <button className="secondary-button btn btn-secondary" onClick={onViewSettings}>
            {t('settings', language)}
          </button>
          <button className="secondary-button btn btn-secondary" onClick={onRestart}>
            {t('assess_another_person', language)}
          </button>
        </div>

        <div className="privacy-footer">
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {t('data_protected', language)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;