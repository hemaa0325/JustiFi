import React, { useState, useEffect } from 'react';
import * as bankerService from '../services/bankerService';
import '../styles/BankerDashboard.css';

const BankerDashboard = ({ onLogout, language }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Poll for loan requests updates
  useEffect(() => {
    if (activeTab === 'loanRequests') {
      const interval = setInterval(() => {
        fetchLoanRequests();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await bankerService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanRequests = async () => {
    try {
      setLoading(true);
      const data = await bankerService.getLoanRequests();
      setLoanRequests(data);
    } catch (error) {
      console.error('Error fetching loan requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const data = await bankerService.getUserDetails(userId);
      setUserDetails(data);
      setSelectedUser(data.user);
      setActiveTab('assessment');
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const performAssessment = async (userId) => {
    try {
      setLoading(true);
      const data = await bankerService.performAssessment(userId);
      setAssessmentResult(data);
      setActiveTab('results');
    } catch (error) {
      console.error('Error performing assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      setLoading(true);
      const result = await bankerService.updateLoanStatus(loanId, 'approved');
      // Refresh loan requests
      fetchLoanRequests();
      // Show success message
      alert('Loan approved successfully!');
      
      // In a real application, we would send a notification to the user
      console.log('Loan approved, notification should be sent to user');
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Failed to approve loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      setLoading(true);
      const result = await bankerService.updateLoanStatus(loanId, 'rejected');
      // Refresh loan requests
      fetchLoanRequests();
      // Show success message
      alert('Loan rejected successfully!');
      
      // In a real application, we would send a notification to the user
      console.log('Loan rejected, notification should be sent to user');
    } catch (error) {
      console.error('Error rejecting loan:', error);
      alert('Failed to reject loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedUser(null);
    setUserDetails(null);
    setAssessmentResult(null);
    setActiveTab('users');
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 30) return 'poor';
    return 'very-poor';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderUsersList = () => (
    <div className="users-list card">
      <div className="dashboard-header">
        <h2 className="section-title">All Users</h2>
        <button className="refresh-button btn btn-secondary" onClick={fetchUsers}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          Refresh
        </button>
      </div>
      {loading ? (
        <p className="loading">Loading users...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Occupation</th>
              <th>Credit Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.fullName || user.username}</td>
                <td>{user.email}</td>
                <td>{user.occupation || 'N/A'}</td>
                <td>{user.creditScore || 'Not assessed'}</td>
                <td>
                  <button onClick={() => fetchUserDetails(user.id)} className="btn btn-primary">
                    Assess
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderLoanRequests = () => (
    <div className="loan-requests card">
      <div className="dashboard-header">
        <h2 className="section-title">Pending Loan Requests</h2>
        <button className="refresh-button btn btn-secondary" onClick={fetchLoanRequests}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          Refresh
        </button>
      </div>
      {loading ? (
        <p className="loading">Loading loan requests...</p>
      ) : (
        <table className="loan-requests-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Requested On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loanRequests.filter(lr => lr.status === 'pending').map(loanRequest => {
              const user = users.find(u => u.id === loanRequest.user_id) || {};
              return (
                <tr key={loanRequest.id}>
                  <td>{user.fullName || user.username || 'Unknown User'}</td>
                  <td>₹{loanRequest.amount?.toLocaleString()}</td>
                  <td>{formatDate(loanRequest.created_at)}</td>
                  <td>
                    <span className={`status-badge ${loanRequest.status}`}>
                      {loanRequest.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleApproveLoan(loanRequest.id)} 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectLoan(loanRequest.id)} 
                        className="btn btn-secondary"
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {loanRequests.filter(lr => lr.status === 'pending').length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">
                  No pending loan requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderAssessmentPanel = () => (
    <div className="assessment-panel card">
      <div className="panel-header">
        <h2 className="section-title">User Assessment: {selectedUser?.fullName || selectedUser?.username}</h2>
        <button onClick={resetSelection} className="back-button btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Users
        </button>
      </div>
      
      {userDetails && (
        <div className="user-details">
          <h3 className="subsection-title">User Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label className="label">Email:</label>
              <span className="value">{userDetails.user.email}</span>
            </div>
            <div className="info-item">
              <label className="label">Phone:</label>
              <span className="value">{userDetails.user.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label className="label">Address:</label>
              <span className="value">{userDetails.user.address || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label className="label">Occupation:</label>
              <span className="value">{userDetails.user.occupation || 'N/A'}</span>
            </div>
          </div>
          
          <h3 className="subsection-title">Submitted Documents ({userDetails.documents.length})</h3>
          <div className="documents-list">
            {userDetails.documents.length > 0 ? (
              userDetails.documents.map(doc => (
                <div key={doc.id} className="document-item">
                  <span className="document-name">{doc.name}</span>
                  <span className="document-type">({doc.type})</span>
                </div>
              ))
            ) : (
              <p className="no-documents">No documents submitted</p>
            )}
          </div>
          
          <h3 className="subsection-title">Transaction History ({userDetails.transactions.length} items)</h3>
          <div className="transactions-list">
            {userDetails.transactions.length > 0 ? (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails.transactions.slice(0, 10).map(transaction => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td>${Math.abs(transaction.amount).toFixed(2)}</td>
                      <td>{transaction.category || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-transactions">No transaction history available</p>
            )}
          </div>
          
          <button 
            onClick={() => performAssessment(selectedUser.id)} 
            className="assess-button btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Perform Advanced AI Assessment'}
          </button>
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="results-panel card">
      <div className="panel-header">
        <h2 className="section-title">AI Assessment Results</h2>
        <button onClick={resetSelection} className="back-button btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Users
        </button>
      </div>
      
      {assessmentResult && (
        <div className="results-content">
          <div className={`score-card ${getScoreClass(assessmentResult.score)}`}>
            <h3 className="subsection-title">Credit Score</h3>
            <div className="score-value">{assessmentResult.score}/100</div>
            <div className="decision">
              Decision: <strong>{assessmentResult.decision.replace('_', ' ')}</strong>
            </div>
            <div className="loan-amount">
              Recommended Loan Amount: <strong>${assessmentResult.loanAmount.toLocaleString()}</strong>
            </div>
            <div className="safety-level">
              Safety Level: <strong>{assessmentResult.safetyLevel}</strong>
            </div>
          </div>
          
          <div className="reasons-section">
            <h3 className="subsection-title">Analysis Explanations</h3>
            <ul className="explanations-list">
              {assessmentResult.explanations && assessmentResult.explanations.length > 0 ? (
                assessmentResult.explanations.slice(0, 5).map((explanation, index) => (
                  <li key={index} className="explanation-item">
                    <div className="explanation-content">
                      <span className="explanation-text">{explanation.explanation || explanation}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="explanation-item">
                  <div className="explanation-content">
                    <span className="explanation-text">No explanations available</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={() => {
                // In a real app, this would initiate the disbursement process
                alert('Loan disbursement would be initiated here');
              }} 
              className="disburse-button btn btn-primary"
              disabled={assessmentResult.decision === 'REJECT' || assessmentResult.decision === 'REVIEW'}
            >
              Disburse Loan
            </button>
            <button 
              onClick={() => {
                // In a real app, this would reject the application
                alert('Application would be rejected here');
              }} 
              className="reject-button btn btn-secondary"
            >
              Reject
            </button>
            <button 
              onClick={() => {
                // In a real app, this would put the application on hold
                alert('Application would be put on hold for review');
              }} 
              className="hold-button btn btn-secondary"
            >
              Put on Hold
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="banker-dashboard">
      <div className="app-container">
        <div className="dashboard-header card">
          <h1 className="dashboard-title">Banker Dashboard</h1>
          <div className="header-actions">
            <div className="dashboard-tabs">
              <button 
                className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button 
                className={`btn ${activeTab === 'loanRequests' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab('loanRequests');
                  fetchLoanRequests();
                }}
              >
                Loan Requests
              </button>
              <button 
                className={`btn ${activeTab === 'assessment' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => activeTab === 'assessment' && setSelectedUser(null)}
                disabled={activeTab !== 'assessment' && !selectedUser}
              >
                Assessment
              </button>
              <button 
                className={`btn ${activeTab === 'results' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => activeTab === 'results' && setAssessmentResult(null)}
                disabled={activeTab !== 'results' && !assessmentResult}
              >
                Results
              </button>
            </div>
            <button onClick={onLogout} className="logout-button btn btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {activeTab === 'users' && renderUsersList()}
          {activeTab === 'loanRequests' && renderLoanRequests()}
          {activeTab === 'assessment' && renderAssessmentPanel()}
          {activeTab === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
};

export default BankerDashboard;