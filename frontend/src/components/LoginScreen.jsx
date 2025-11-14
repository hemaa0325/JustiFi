import React, { useState } from 'react';
import '../styles/LoginScreen.css';
import { login, signup } from '../services/authService';
import { t } from '../utils/localization';

const LoginScreen = ({ onLogin, language }) => {
  const [isLogin, setIsLogin] = useState(true);
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
          fullName: formData.username
          // Removed role from frontend - always default to user on backend
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

  const renderSignupForm = () => (
    <>
      <div className="form-group">
        <label className="label">{t('username', language)}</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      
      <div className="form-group">
        <label className="label">{t('email', language)}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      
      <div className="form-group">
        <label className="label">{t('password', language)}</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      
      <div className="form-group">
        <label className="label">{t('confirm_password', language)}</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
    </>
  );

  return (
    <div className="app-container">
      <div className="login-screen">
        <div className="card">
          <div className="logo text-center">
            <h1 className="logo-title">{t('justifi', language)}</h1>
            <p className="logo-subtitle">{t('instant_micro_loans', language)}</p>
          </div>

          <div className="auth-toggle">
            <button 
              className={`btn ${isLogin ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              {t('login', language)}
            </button>
            <button 
              className={`btn ${!isLogin ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              {t('signup', language)}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isLogin ? (
              <>
                <div className="form-group">
                  <label className="label">{t('email_or_username', language)}</label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">{t('password', language)}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </>
            ) : (
              renderSignupForm()
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('processing', language) : (isLogin ? t('login', language) : t('signup', language))}
            </button>
          </form>
          
          <div className="auth-footer text-center">
            <p>
              {isLogin ? t('dont_have_account', language) : t('already_have_account', language)}{' '}
              <button 
                className="switch-auth" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? t('signup', language) : t('login', language)}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;