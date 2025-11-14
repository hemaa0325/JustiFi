import React, { useState, useEffect } from 'react';
import '../styles/LoanHistory.css';
import { t } from '../utils/localization';
import { getCurrentUser } from '../services/authService';
import * as loanService from '../services/loanService';

const LoanHistory = ({ onBack, language }) => {
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch loan history from backend
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Fetch real loan requests from backend
      const loanRequests = await loanService.getUserLoanRequests(currentUser.id);
      
      // Transform loan requests to match expected format
      const transformedLoans = loanRequests.map(request => ({
        id: request.id,
        amount: request.amount,
        status: request.status.toUpperCase(),
        timestamp: request.created_at,
        // For approved loans, we might want to show the approval date
        approvalDate: request.approved_at,
        // For disbursed loans, we might want to show the disbursement date
        disbursementDate: request.disbursed_at
      }));
      
      setLoanHistory(transformedLoans);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loan history:', error);
      setError(error.message);
      setLoading(false);
      
      // Fallback to mock data if API fails
      const mockHistory = [
        {
          id: 'txn-1',
          amount: 5000,
          status: 'DISBURSED',
          timestamp: '2025-10-15T10:30:00Z',
          repaymentDate: '2025-11-15T10:30:00Z'
        },
        {
          id: 'txn-2',
          amount: 3000,
          status: 'DISBURSED',
          timestamp: '2025-09-20T14:15:00Z',
          repaymentDate: '2025-10-20T14:15:00Z'
        },
        {
          id: 'txn-3',
          amount: 7000,
          status: 'APPROVED',
          timestamp: '2025-11-01T09:45:00Z'
        }
      ];
      
      setLoanHistory(mockHistory);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISBURSED': return 'var(--color-success-500)';
      case 'APPROVED': return 'var(--color-success-500)';
      case 'PENDING': return 'var(--color-warning-500)';
      case 'REJECTED': return 'var(--color-danger-500)';
      case 'REPAID': return 'var(--color-primary-500)';
      default: return 'var(--color-secondary-500)';
    }
  };

  const getStatusText = (status, lang) => {
    switch (status) {
      case 'DISBURSED': return t('disbursed', lang);
      case 'APPROVED': return t('loan_approved', lang);
      case 'PENDING': return t('pending', lang);
      case 'REJECTED': return t('rejected', lang);
      case 'REPAID': return t('repaid', lang);
      default: return status;
    }
  };

  return (
    <div className="loan-history-screen">
      <div className="header">
        <button className="back-button btn btn-secondary" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </button>
        <h1 className="page-title">{t('loan_history', language)}</h1>
      </div>
      <div className="history-container">
        {loading ? (
          <div className="loading card">{t('loading_loan_history', language)}...</div>
        ) : error ? (
          <div className="error card">
            <p>{t('error_loading_loan_history', language)}: {error}</p>
            <button className="btn btn-primary" onClick={fetchLoanHistory}>
              {t('try_again', language)}
            </button>
          </div>
        ) : loanHistory.length === 0 ? (
          <div className="empty-state card">
            <p>{t('no_loan_history_found', language)}</p>
          </div>
        ) : (
          <div className="history-list">
            {loanHistory.map((loan) => (
              <div key={loan.id} className="loan-item card">
                <div className="loan-header">
                  <div className="loan-amount">₹{loan.amount.toLocaleString()}</div>
                  <div 
                    className="loan-status" 
                    style={{ backgroundColor: getStatusColor(loan.status) }}
                  >
                    {getStatusText(loan.status, language)}
                  </div>
                </div>
                <div className="loan-details">
                  <div className="detail-row">
                    <span className="label">{t('transaction_id', language)}:</span>
                    <span className="value">{loan.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">
                      {loan.status === 'APPROVED' ? t('approved', language) : t('disbursed', language)}:
                    </span>
                    <span className="value">
                      {formatDate(loan.approvalDate || loan.disbursementDate || loan.timestamp)}
                    </span>
                  </div>
                  {loan.status === 'DISBURSED' && (
                    <div className="detail-row">
                      <span className="label">{t('repayment_due', language)}:</span>
                      <span className="value">{formatDate(loan.repaymentDate || new Date(Date.parse(loan.timestamp) + 30 * 24 * 60 * 60 * 1000))}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanHistory;