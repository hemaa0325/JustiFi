import React, { useState, useEffect } from 'react';
import { bankerService } from '../services/bankerService';
import './BankerDashboard.css';

const BankerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const resetSelection = () => {
    setSelectedUser(null);
    setUserDetails(null);
    setAssessmentResult(null);
    setActiveTab('users');
  };

  const renderUsersList = () => (
    <div className="users-list">
      <h2>All Users</h2>
      {loading ? (
        <p>Loading users...</p>
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
                  <button onClick={() => fetchUserDetails(user.id)}>
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

  const renderAssessmentPanel = () => (
    <div className="assessment-panel">
      <div className="panel-header">
        <h2>User Assessment: {selectedUser?.fullName || selectedUser?.username}</h2>
        <button onClick={resetSelection} className="back-button">Back to Users</button>
      </div>
      
      {userDetails && (
        <div className="user-details">
          <h3>User Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Email:</label>
              <span>{userDetails.user.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{userDetails.user.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Address:</label>
              <span>{userDetails.user.address || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Occupation:</label>
              <span>{userDetails.user.occupation || 'N/A'}</span>
            </div>
          </div>
          
          <h3>Submitted Documents ({userDetails.documents.length})</h3>
          <div className="documents-list">
            {userDetails.documents.length > 0 ? (
              userDetails.documents.map(doc => (
                <div key={doc.id} className="document-item">
                  <span>{doc.name}</span>
                  <span className="doc-type">({doc.type})</span>
                </div>
              ))
            ) : (
              <p>No documents submitted</p>
            )}
          </div>
          
          <h3>Transaction History ({userDetails.transactions.length} items)</h3>
          <div className="transactions-list">
            {userDetails.transactions.length > 0 ? (
              <table>
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
              <p>No transaction history available</p>
            )}
          </div>
          
          <button 
            onClick={() => performAssessment(selectedUser.id)} 
            className="assess-button"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Perform Advanced AI Assessment'}
          </button>
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="results-panel">
      <div className="panel-header">
        <h2>AI Assessment Results</h2>
        <button onClick={resetSelection} className="back-button">Back to Users</button>
      </div>
      
      {assessmentResult && (
        <div className="results-content">
          <div className={`score-card ${getScoreClass(assessmentResult.score)}`}>
            <h3>Credit Score</h3>
            <div className="score-value">{assessmentResult.score}/100</div>
            <div className="decision">
              Decision: <strong>{assessmentResult.decision.replace('_', ' ')}</strong>
            </div>
            <div className="loan-amount">
              Recommended Loan Amount: <strong>${assessmentResult.loanAmount.toLocaleString()}</strong>
            </div>
          </div>
          
          <div className="message-section">
            <h3>AI Analysis Summary</h3>
            <p>{assessmentResult.message}</p>
          </div>
          
          <div className="detailed-analysis">
            <h3>Detailed Component Scores</h3>
            <div className="component-scores">
              {Object.entries(assessmentResult.componentScores).map(([component, data]) => (
                <div key={component} className="component-score">
                  <div className="component-name">{component.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="component-value">{data.score}/50</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="reasons-section">
            <h3>Scoring Factors</h3>
            <ul className="reasons-list">
              {assessmentResult.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
          
          <div className="external-data">
            <h3>External Credit Bureau Data</h3>
            <div className="external-info">
              <div className="info-item">
                <label>External Score:</label>
                <span>{assessmentResult.externalData.score}</span>
              </div>
              <div className="info-item">
                <label>Inquiries:</label>
                <span>{assessmentResult.externalData.inquiries}</span>
              </div>
              <div className="info-item">
                <label>Derogatory Marks:</label>
                <span>{assessmentResult.externalData.derogatoryMarks}</span>
              </div>
              <div className="info-item">
                <label>Credit Age:</label>
                <span>{Math.floor(assessmentResult.externalData.creditAgeMonths / 12)} years</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  };

  return (
    <div className="banker-dashboard">
      <header className="dashboard-header">
        <h1>Banker Dashboard</h1>
        <nav className="dashboard-tabs">
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'assessment' ? 'active' : ''}
            onClick={() => selectedUser && setActiveTab('assessment')}
            disabled={!selectedUser}
          >
            Assessment
          </button>
          <button 
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => assessmentResult && setActiveTab('results')}
            disabled={!assessmentResult}
          >
            Results
          </button>
        </nav>
      </header>
      
      <main className="dashboard-content">
        {activeTab === 'users' && renderUsersList()}
        {activeTab === 'assessment' && renderAssessmentPanel()}
        {activeTab === 'results' && renderResults()}
      </main>
    </div>
  );
};

export default BankerDashboard;