import React, { useState, useEffect } from 'react';
import '../styles/BankerDashboard.css';
import { getAllUsers, getUserDetails, getUserDocuments, downloadDocument } from '../services/bankerService';
import { logout } from '../services/authService';
import { t } from '../utils/localization';

const BankerDashboard = ({ onLogout, language }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocuments, setUserDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [filterDecision, setFilterDecision] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const usersData = await getAllUsers();
      
      // Fetch documents and detailed info for each user
      const usersWithDetails = await Promise.all(usersData.map(async (user) => {
        try {
          // Get detailed user info with credit score
          const userDetails = await getUserDetails(user.id);
          
          // Get user documents
          const documents = await getUserDocuments(user.id);
          
          return { 
            ...user, 
            ...userDetails,
            documents: documents || [] 
          };
        } catch (err) {
          // If we can't fetch details for a user, continue with basic info
          return { 
            ...user, 
            documents: [],
            creditScore: 'N/A',
            creditDecision: 'N/A'
          };
        }
      }));
      
      setUsers(usersWithDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setLoading(true);
    setError('');
    setSelectedUser(user);
    
    try {
      // Fetch user documents for detailed view
      const documents = await getUserDocuments(user.id);
      setUserDocuments(documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (docId) => {
    try {
      await downloadDocument(docId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setUserDocuments([]);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const getCreditScoreColor = (score) => {
    if (score >= 80) return 'high-score';
    if (score >= 60) return 'medium-score';
    if (score >= 45) return 'low-score';
    return 'very-low-score';
  };

  const getCreditDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVE': return 'approve';
      case 'APPROVE_WITH_CAP': return 'approve-with-cap';
      case 'REVIEW': return 'review';
      case 'REJECT': return 'reject';
      default: return '';
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      // Search filter - check name, email, and username
      const matchesSearch = 
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Score filter
      const matchesScore = filterScore === 'all' || 
        (filterScore === 'excellent' && user.creditScore >= 80) ||
        (filterScore === 'good' && user.creditScore >= 60 && user.creditScore < 80) ||
        (filterScore === 'fair' && user.creditScore >= 45 && user.creditScore < 60) ||
        (filterScore === 'poor' && user.creditScore < 45);
      
      // Decision filter
      const matchesDecision = filterDecision === 'all' || user.creditDecision === filterDecision;
      
      return matchesSearch && matchesScore && matchesDecision;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = (a.full_name || a.username || '').toLowerCase();
          bValue = (b.full_name || b.username || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'score':
          aValue = a.creditScore || 0;
          bValue = b.creditScore || 0;
          break;
        case 'decision':
          aValue = (a.creditDecision || '').toLowerCase();
          bValue = (b.creditDecision || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterScore('all');
    setFilterDecision('all');
  };

  return (
    <div className="banker-dashboard">
      <header className="dashboard-header">
        <h1>{t('banker_dashboard', language)}</h1>
        <div className="header-actions">
          <button className="logout-button" onClick={handleLogout}>
            {t('logout', language)}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            {t('loading', language)}...
          </div>
        )}

        {/* User List View */}
        {!selectedUser ? (
          <div className="users-list">
            <div className="dashboard-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder={t('search_users', language)}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filters">
                <select 
                  value={filterScore} 
                  onChange={(e) => setFilterScore(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t('all_scores', language)}</option>
                  <option value="excellent">{t('excellent', language)}</option>
                  <option value="good">{t('good', language)}</option>
                  <option value="fair">{t('fair', language)}</option>
                  <option value="poor">{t('poor', language)}</option>
                </select>
                
                <select 
                  value={filterDecision} 
                  onChange={(e) => setFilterDecision(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t('all_decisions', language)}</option>
                  <option value="APPROVE">{t('approve', language)}</option>
                  <option value="APPROVE_WITH_CAP">{t('approve_with_cap', language)}</option>
                  <option value="REVIEW">{t('review', language)}</option>
                  <option value="REJECT">{t('reject', language)}</option>
                </select>
                
                <button onClick={clearFilters} className="clear-filters-button">
                  {t('clear_filters', language)}
                </button>
                
                <button onClick={fetchAllUsers} className="refresh-button">
                  {t('refresh', language)}
                </button>
              </div>
            </div>
            
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable">
                      {t('name', language)}{renderSortIndicator('name')}
                    </th>
                    <th onClick={() => handleSort('email')} className="sortable">
                      {t('email', language)}{renderSortIndicator('email')}
                    </th>
                    <th>{t('documents', language)}</th>
                    <th onClick={() => handleSort('score')} className="sortable">
                      {t('credit_score', language)}{renderSortIndicator('score')}
                    </th>
                    <th onClick={() => handleSort('decision')} className="sortable">
                      {t('credit_decision', language)}{renderSortIndicator('decision')}
                    </th>
                    <th>{t('actions', language)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map(user => (
                    <tr key={user.id} className="user-row">
                      <td>
                        <div className="user-info">
                          <div className="user-name">
                            {user.full_name || user.username}
                          </div>
                          <div className="user-email-mobile">{user.email}</div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="documents-cell">
                          {user.documents.length > 0 ? (
                            <div className="documents-list">
                              {user.documents.map(doc => (
                                <div key={doc.id} className="document-item">
                                  <span className="document-name" title={doc.name}>{doc.name}</span>
                                  <button 
                                    className="document-download"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadDocument(doc.id);
                                    }}
                                  >
                                    {t('download', language)}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="no-documents">{t('no_documents', language)}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="score-cell">
                          <span className={`score-value ${getCreditScoreColor(user.creditScore)}`}>
                            {user.creditScore}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="decision-cell">
                          <span className={`decision-badge ${getCreditDecisionColor(user.creditDecision)}`}>
                            {user.creditDecision ? t(user.creditDecision.toLowerCase(), language) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="view-details-button"
                          onClick={() => handleUserSelect(user)}
                        >
                          {t('view_details', language)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAndSortedUsers.length === 0 && !loading && (
                <div className="no-users-message">
                  {t('no_users_found', language)}
                </div>
              )}
            </div>
            
            {/* Summary Stats */}
            <div className="dashboard-summary">
              <div className="summary-card">
                <h3>{t('total_users', language)}</h3>
                <p>{users.length}</p>
              </div>
              <div className="summary-card">
                <h3>{t('filtered_users', language)}</h3>
                <p>{filteredAndSortedUsers.length}</p>
              </div>
            </div>
          </div>
        ) : (
          /* User Details View */
          <div className="user-details">
            <button className="back-button" onClick={handleBackToUsers}>
              ← {t('back_to_users', language)}
            </button>
            
            <div className="user-profile">
              <h2>{t('user_profile', language)}</h2>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>{t('name', language)}:</label>
                  <span>{selectedUser.full_name || selectedUser.username}</span>
                </div>
                <div className="profile-field">
                  <label>{t('email', language)}:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="profile-field">
                  <label>{t('phone', language)}:</label>
                  <span>{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="profile-field">
                  <label>{t('address', language)}:</label>
                  <span>{selectedUser.address || 'N/A'}</span>
                </div>
                <div className="profile-field">
                  <label>{t('occupation', language)}:</label>
                  <span>{selectedUser.occupation || 'N/A'}</span>
                </div>
                <div className="profile-field">
                  <label>{t('credit_score', language)}:</label>
                  <span className={`score-value ${getCreditScoreColor(selectedUser.creditScore)}`}>
                    {selectedUser.creditScore}
                  </span>
                </div>
                <div className="profile-field">
                  <label>{t('credit_decision', language)}:</label>
                  <span className={`decision-badge ${getCreditDecisionColor(selectedUser.creditDecision)}`}>
                    {t(selectedUser.creditDecision.toLowerCase(), language)}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-documents">
              <h2>{t('uploaded_documents', language)}</h2>
              {userDocuments.length > 0 ? (
                <div className="documents-grid">
                  {userDocuments.map(doc => (
                    <div key={doc.id} className="document-card">
                      <div className="document-info">
                        <h3>{doc.name}</h3>
                        <p className="document-meta">
                          <span className="document-type">{doc.type.toUpperCase()}</span>
                          <span className="document-size">{doc.size}</span>
                          <span className="document-date">{doc.uploadDate}</span>
                        </p>
                      </div>
                      <button 
                        className="download-button"
                        onClick={() => handleDownloadDocument(doc.id)}
                      >
                        {t('download', language)}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t('no_documents_uploaded', language)}</p>
              )}
            </div>

            {/* Credit Score Justification */}
            <div className="credit-justification">
              <h2>{t('score_justification', language)}</h2>
              {selectedUser.reasons && selectedUser.reasons.length > 0 ? (
                <ul className="justification-list">
                  {selectedUser.reasons.map((reason, index) => (
                    <li key={index} className="justification-item">
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t('no_data_available', language)}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BankerDashboard;