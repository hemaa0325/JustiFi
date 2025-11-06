import React, { useState, useEffect } from 'react';
import '../styles/LoanHistory.css';
import { t } from '../utils/localization';

const LoanHistory = ({ onBack, language }) => {
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch loan history from backend
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch from the backend
      // For this demo, we'll use mock data
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
          status: 'PENDING',
          timestamp: '2025-11-01T09:45:00Z',
          repaymentDate: '2025-12-01T09:45:00Z'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setLoanHistory(mockHistory);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching loan history:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISBURSED': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'REPAID': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status, lang) => {
    switch (status) {
      case 'DISBURSED': return t('disbursed', lang);
      case 'PENDING': return t('pending', lang);
      case 'REPAID': return t('repaid', lang);
      default: return status;
    }
  };

  return (
    <div className="loan-history-screen">
      <div className="header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>{t('loan_history', language)}</h1>
      </div>
      <div className="history-container">
        {loading ? (
          <div className="loading">{t('loading_loan_history', language)}...</div>
        ) : loanHistory.length === 0 ? (
          <div className="empty-state">
            <p>{t('no_loan_history_found', language)}</p>
          </div>
        ) : (
          <div className="history-list">
            {loanHistory.map((loan) => (
              <div key={loan.id} className="loan-item">
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
                    <span className="label">{t('disbursed', language)}:</span>
                    <span className="value">{formatDate(loan.timestamp)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">{t('repayment_due', language)}:</span>
                    <span className="value">{formatDate(loan.repaymentDate)}</span>
                  </div>
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