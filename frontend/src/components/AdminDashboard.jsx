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
      <div className="app-container">
        <header className="dashboard-header card">
          <h1 className="dashboard-title">{t('admin_dashboard', language)}</h1>
          <div className="header-actions">
            <button className="logout-button btn btn-secondary" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              {t('logout', language)}
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          {error && (
            <div className="error-message card">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading card">
              {t('loading', language)}...
            </div>
          )}

          {/* User List View */}
          {!selectedUser ? (
            <div className="users-list card">
              <div className="dashboard-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder={t('search_users', language)}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input input"
                  />
                </div>
                
                <button onClick={fetchAllUsers} className="refresh-button btn btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M3 21v-5h5"/>
                  </svg>
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
                            onClick={() => handleUserSelect(user)}
                            className="view-button btn btn-primary"
                          >
                            {t('view', language)}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="delete-button btn btn-secondary"
                            disabled={user.role === 'admin'}
                          >
                            {t('delete', language)}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredUsers.length === 0 && (
                  <div className="no-users">
                    {t('no_users_found', language)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* User Detail View */
            <div className="user-detail card">
              <div className="detail-header">
                <button 
                  onClick={handleBackToUsers}
                  className="back-button btn btn-secondary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                  </svg>
                  {t('back_to_users', language)}
                </button>
                <h2 className="user-detail-title">{selectedUser.full_name || selectedUser.username}</h2>
                {!editMode ? (
                  <button 
                    onClick={handleEditUser}
                    className="edit-button btn btn-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                    {t('edit', language)}
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      onClick={handleSaveUser}
                      className="save-button btn btn-primary"
                    >
                      {t('save', language)}
                    </button>
                    <button 
                      onClick={() => setEditMode(false)}
                      className="cancel-button btn btn-secondary"
                    >
                      {t('cancel', language)}
                    </button>
                  </div>
                )}
              </div>
              
              {editMode ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label className="label">{t('full_name', language)}</label>
                    <input
                      type="text"
                      value={editUserData.fullName}
                      onChange={(e) => handleEditUserChange('fullName', e.target.value)}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">{t('email', language)}</label>
                    <input
                      type="email"
                      value={editUserData.email}
                      onChange={(e) => handleEditUserChange('email', e.target.value)}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">{t('phone', language)}</label>
                    <input
                      type="text"
                      value={editUserData.phone}
                      onChange={(e) => handleEditUserChange('phone', e.target.value)}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">{t('address', language)}</label>
                    <input
                      type="text"
                      value={editUserData.address}
                      onChange={(e) => handleEditUserChange('address', e.target.value)}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">{t('occupation', language)}</label>
                    <input
                      type="text"
                      value={editUserData.occupation}
                      onChange={(e) => handleEditUserChange('occupation', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              ) : (
                <div className="user-details">
                  <div className="detail-row">
                    <span className="detail-label">{t('email', language)}:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">{t('phone', language)}:</span>
                    <span className="detail-value">{selectedUser.phone || t('not_provided', language)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">{t('address', language)}:</span>
                    <span className="detail-value">{selectedUser.address || t('not_provided', language)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">{t('occupation', language)}:</span>
                    <span className="detail-value">{selectedUser.occupation || t('not_provided', language)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">{t('role', language)}:</span>
                    <span className="detail-value">
                      <span className={`role-badge ${selectedUser.role}`}>
                        {selectedUser.role}
                      </span>
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">{t('created_at', language)}:</span>
                    <span className="detail-value">
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">{t('last_login', language)}:</span>
                    <span className="detail-value">
                      {selectedUser.last_login 
                        ? new Date(selectedUser.last_login).toLocaleString()
                        : t('never', language)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;