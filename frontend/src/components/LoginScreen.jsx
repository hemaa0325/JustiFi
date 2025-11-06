import React, { useState } from 'react';
import '../styles/LoginScreen.css';
import { login, signup } from '../services/authService';
import { t } from '../utils/localization';

const LoginScreen = ({ onLogin, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleSelection(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const identifier = formData.username || formData.email;
        await login(identifier, formData.password);
        onLogin();
      } else {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error(t('passwords_do_not_match', language));
        }
        
        // Password validation - minimum 6 characters
        if (formData.password.length < 6) {
          throw new Error(t('password_min_length', language));
        }
        
        // Email validation - must end with @gmail.com
        if (!formData.email.endsWith('@gmail.com')) {
          throw new Error(t('email_gmail_required', language));
        }
        
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.username,
          role: selectedRole // Add role to user data
        };
        
        await signup(userData);
        onLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <div className="role-selection">
      <h3>{t('select_your_role', language)}</h3>
      <div className="role-options">
        <button 
          className="role-button user-role"
          onClick={() => handleRoleSelect('user')}
        >
          <div className="role-icon">👤</div>
          <div className="role-title">{t('signup_as_user', language)}</div>
          <div className="role-description">{t('user_role_description', language)}</div>
        </button>
        
        <button 
          className="role-button banker-role"
          onClick={() => handleRoleSelect('banker')}
        >
          <div className="role-icon">🏦</div>
          <div className="role-title">{t('signup_as_banker', language)}</div>
          <div className="role-description">{t('banker_role_description', language)}</div>
        </button>
        
        <button 
          className="role-button admin-role"
          onClick={() => handleRoleSelect('admin')}
        >
          <div className="role-icon">👑</div>
          <div className="role-title">{t('signup_as_admin', language)}</div>
          <div className="role-description">{t('admin_role_description', language)}</div>
        </button>
      </div>
      
      <button 
        className="back-button"
        onClick={() => setShowRoleSelection(false)}
      >
        {t('back', language)}
      </button>
    </div>
  );

  const renderSignupForm = () => {
    if (showRoleSelection) {
      return renderRoleSelection();
    }
    
    if (!selectedRole) {
      return (
        <div className="role-prompt">
          <button 
            className="select-role-button"
            onClick={() => setShowRoleSelection(true)}
          >
            {t('select_role_to_continue', language)}
          </button>
          <div className="selected-role">
            {t('no_role_selected', language)}
          </div>
        </div>
      );
    }
    
    return (
      <>
        <div className="selected-role-display">
          <span className="role-label">{t('selected_role', language)}:</span>
          <span className={`role-badge ${selectedRole}-badge`}>
            {selectedRole === 'user' && t('user', language)}
            {selectedRole === 'banker' && t('banker', language)}
            {selectedRole === 'admin' && t('admin', language)}
          </span>
          <button 
            className="change-role-button"
            onClick={() => setShowRoleSelection(true)}
          >
            {t('change', language)}
          </button>
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder={t('username', language)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('email', language)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('password', language)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('confirm_password', language)}
            required
          />
        </div>
      </>
    );
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="logo">
          <h1>{t('justifi', language)}</h1>
          <p>{t('instant_micro_loans', language)}</p>
        </div>

        <div className="auth-toggle">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSelectedRole('');
              setShowRoleSelection(false);
            }}
          >
            {t('login', language)}
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSelectedRole('');
              setShowRoleSelection(false);
            }}
          >
            {t('signup', language)}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isLogin ? (
            <>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('email_or_username', language)}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('password', language)}
                  required
                />
              </div>
            </>
          ) : (
            renderSignupForm()
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          {isLogin || selectedRole ? (
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? t('processing', language) : (isLogin ? t('login', language) : t('signup', language))}
            </button>
          ) : null}
        </form>
        
        <div className="auth-footer">
          <p>
            {isLogin ? t('dont_have_account', language) : t('already_have_account', language)}{' '}
            <button 
              className="switch-auth" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSelectedRole('');
                setShowRoleSelection(false);
              }}
            >
              {isLogin ? t('signup', language) : t('login', language)}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;