import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import { getAllUsersForAdmin, getUserDetailsForAdmin, updateUserForAdmin, deleteUserForAdmin } from '../services/adminService';
import { logout } from '../services/authService';
import { t } from '../utils/localization';

const AdminDashboard = ({ onLogout, language }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editUserData, setEditUserData] = useState({});

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const usersData = await getAllUsersForAdmin();
      setUsers(usersData);
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
    setEditMode(false);
    setEditUserData({});
    
    try {
      // Fetch detailed user info
      const userDetails = await getUserDetailsForAdmin(user.id);
      setSelectedUser(userDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setEditMode(false);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleEditUser = () => {
    setEditMode(true);
    setEditUserData({
      fullName: selectedUser.full_name || '',
      email: selectedUser.email || '',
      phone: selectedUser.phone || '',
      address: selectedUser.address || '',
      occupation: selectedUser.occupation || ''
    });
  };

  const handleSaveUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      await updateUserForAdmin(selectedUser.id, editUserData);
      // Refresh user data
      const updatedUser = await getUserDetailsForAdmin(selectedUser.id);
      setSelectedUser(updatedUser);
      setEditMode(false);
      
      // Also update in the main users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, ...updatedUser } : user
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('confirm_delete_user', language))) {
      setLoading(true);
      setError('');
      
      try {
        await deleteUserForAdmin(userId);
        // Remove user from list
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        // If we're viewing the deleted user, go back to user list
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
        }
        
        // Refresh the user list
        await fetchAllUsers();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditUserChange = (field, value) => {
    setEditUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    return (
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>{t('admin_dashboard', language)}</h1>
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
              
              <button onClick={fetchAllUsers} className="refresh-button">
                {t('refresh', language)}
              </button>
            </div>
            
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>{t('name', language)}</th>
                    <th>{t('email', language)}</th>
                    <th>{t('role', language)}</th>
                    <th>{t('created_at', language)}</th>
                    <th>{t('actions', language)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="user-row">
                      <td>
                        <div className="user-info">
                          <div className="user-name">
                            {user.full_name || user.username}
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
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
              
              {filteredUsers.length === 0 && !loading && (
                <div className="no-users-message">
                  {t('no_users_found', language)}
                </div>
              )}
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
              
              {editMode ? (
                <div className="profile-edit-form">
                  <div className="form-group">
                    <label>{t('full_name', language)}:</label>
                    <input
                      type="text"
                      value={editUserData.fullName}
                      onChange={(e) => handleEditUserChange('fullName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('email', language)}:</label>
                    <input
                      type="email"
                      value={editUserData.email}
                      onChange={(e) => handleEditUserChange('email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('phone', language)}:</label>
                    <input
                      type="text"
                      value={editUserData.phone}
                      onChange={(e) => handleEditUserChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('address', language)}:</label>
                    <input
                      type="text"
                      value={editUserData.address}
                      onChange={(e) => handleEditUserChange('address', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('occupation', language)}:</label>
                    <input
                      type="text"
                      value={editUserData.occupation}
                      onChange={(e) => handleEditUserChange('occupation', e.target.value)}
                    />
                  </div>
                  <div className="form-actions">
                    <button className="save-button" onClick={handleSaveUser}>
                      {t('save', language)}
                    </button>
                    <button className="cancel-button" onClick={() => setEditMode(false)}>
                      {t('cancel', language)}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>{t('username', language)}:</label>
                    <span>{selectedUser.username}</span>
                  </div>
                  <div className="profile-field">
                    <label>{t('full_name', language)}:</label>
                    <span>{selectedUser.full_name || 'N/A'}</span>
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
                    <label>{t('role', language)}:</label>
                    <span>
                      <span className={`role-badge ${selectedUser.role}`}>
                        {selectedUser.role}
                      </span>
                    </span>
                  </div>
                  <div className="profile-field">
                    <label>{t('created_at', language)}:</label>
                    <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedUser.creditScore !== undefined && (
                    <div className="profile-field">
                      <label>{t('credit_score', language)}:</label>
                      <span>{selectedUser.creditScore}</span>
                    </div>
                  )}
                  {selectedUser.creditDecision !== undefined && (
                    <div className="profile-field">
                      <label>{t('credit_decision', language)}:</label>
                      <span>{selectedUser.creditDecision}</span>
                    </div>
                  )}
                </div>
              )}
              
              {!editMode && (
                <div className="user-actions">
                  <button className="edit-button" onClick={handleEditUser}>
                    {t('edit', language)}
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteUser(selectedUser.id)}
                  >
                    {t('delete', language)}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;