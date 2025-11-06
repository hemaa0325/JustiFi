import { useState, useEffect } from 'react'
import './App.css'
import OnboardingScreen from './components/OnboardingScreen'
import UploadScreen from './components/UploadScreen'
import ResultScreen from './components/ResultScreen'
import ProfileScreen from './components/ProfileScreen'
import LoanHistory from './components/LoanHistory'
import SpendingPatterns from './components/SpendingPatterns'
import SettingsScreen from './components/SettingsScreen'
import LoginScreen from './components/LoginScreen'
import NotificationsScreen from './components/NotificationsScreen'
import NotificationSystem from './components/NotificationSystem'
import BankerDashboard from './components/BankerDashboard'
import AdminDashboard from './components/AdminDashboard'
import { t } from './utils/localization'
import { getCurrentUser } from './services/authService'

function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding')
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState('user-1') // Default user ID
  const [language, setLanguage] = useState('en')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      // Apply dark mode class to body
      if (settings.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Set language
      setLanguage(settings.language || 'en');
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    
    // Get current user info
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // Check if user is a banker or admin
    if (user && user.role === 'banker') {
      setCurrentScreen('bankerDashboard');
    } else if (user && user.role === 'admin') {
      setCurrentScreen('adminDashboard');
    } else {
      setCurrentScreen('profile'); // Go directly to profile after login
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('onboarding');
    setCurrentUser(null);
  };

  const handleStart = () => {
    // Always show login screen when clicking "Get Started"
    setShowLogin(true);
  }

  const handleAssessmentComplete = (result) => {
    if (result && result.error) {
      setError(result.error)
      setCurrentScreen('upload')
    } else {
      setAssessmentResult(result)
      setCurrentScreen('result')
      setError(null)
    }
  }

  const handleRestart = () => {
    setCurrentScreen('onboarding')
    setAssessmentResult(null)
    setError(null)
  }

  const handleViewProfile = () => {
    setCurrentScreen('profile')
  }

  const handleViewLoanHistory = () => {
    setCurrentScreen('loanHistory')
  }

  const handleViewSpendingPatterns = () => {
    setCurrentScreen('spendingPatterns')
  }

  const handleViewSettings = () => {
    setCurrentScreen('settings')
  }

  const handleUploadDocument = () => {
    setCurrentScreen('upload')
  }

  const handleViewNotifications = () => {
    setCurrentScreen('notifications')
  }

  const handleBackToProfile = () => {
    setCurrentScreen('profile')
  }

  const handleBackToResult = () => {
    setCurrentScreen('result')
  }

  const handleBackToLoanHistory = () => {
    setCurrentScreen('loanHistory')
  }

  const handleBackToSpendingPatterns = () => {
    setCurrentScreen('spendingPatterns')
  }

  const handleBackToSettings = () => {
    // Update settings when returning from settings screen
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      // Apply dark mode class to body
      if (settings.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Update language
      setLanguage(settings.language || 'en');
    }
    setCurrentScreen('profile')
  }

  // Show login screen when requested
  if (showLogin) {
    return (
      <div className="app">
        <LoginScreen onLogin={handleLogin} language={language} />
      </div>
    );
  }

  // Show onboarding screen
  if (currentScreen === 'onboarding') {
    return (
      <div className="app">
        <NotificationSystem />
        <OnboardingScreen onStart={handleStart} language={language} />
      </div>
    );
  }

  // Show upload screen
  if (currentScreen === 'upload') {
    return (
      <div className="app">
        <NotificationSystem />
        <UploadScreen 
          onAssessmentComplete={handleAssessmentComplete} 
          language={language} 
          onBackToProfile={handleBackToProfile}
        />
      </div>
    );
  }

  // Show result screen
  if (currentScreen === 'result') {
    return (
      <div className="app">
        <NotificationSystem />
        <ResultScreen 
          result={assessmentResult} 
          onRestart={handleRestart} 
          onViewProfile={handleViewProfile}
          onViewLoanHistory={handleViewLoanHistory}
          onViewSpendingPatterns={handleViewSpendingPatterns}
          onViewSettings={handleViewSettings}
          language={language}
        />
      </div>
    );
  }

  // Show profile screen
  if (currentScreen === 'profile') {
    return (
      <div className="app">
        <NotificationSystem />
        <ProfileScreen 
          onBack={handleLogout}
          userId={userId}
          onViewLoanHistory={handleViewLoanHistory}
          onViewSpendingPatterns={handleViewSpendingPatterns}
          onViewSettings={handleViewSettings}
          onUploadDocument={handleUploadDocument}
          onViewNotifications={handleViewNotifications}
          language={language}
        />
      </div>
    );
  }

  // Show banker dashboard
  if (currentScreen === 'bankerDashboard') {
    return (
      <div className="app">
        <BankerDashboard 
          onLogout={handleLogout}
          language={language}
        />
      </div>
    );
  }

  // Show admin dashboard
  if (currentScreen === 'adminDashboard') {
    return (
      <div className="app">
        <NotificationSystem />
        <AdminDashboard 
          onLogout={handleLogout}
          language={language}
        />
      </div>
    );
  }

  // Show loan history screen
  if (currentScreen === 'loanHistory') {
    return (
      <div className="app">
        <NotificationSystem />
        <LoanHistory 
          onBack={handleBackToProfile}
          language={language}
        />
      </div>
    );
  }

  // Show spending patterns screen
  if (currentScreen === 'spendingPatterns') {
    return (
      <div className="app">
        <NotificationSystem />
        <SpendingPatterns 
          onBack={handleBackToProfile}
          language={language}
        />
      </div>
    );
  }

  // Show settings screen
  if (currentScreen === 'settings') {
    return (
      <div className="app">
        <NotificationSystem />
        <SettingsScreen 
          onBack={handleBackToSettings}
          language={language}
        />
      </div>
    );
  }

  // Show notifications screen
  if (currentScreen === 'notifications') {
    return (
      <div className="app">
        <NotificationSystem />
        <NotificationsScreen 
          onBack={handleBackToProfile}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <NotificationSystem />
      <OnboardingScreen onStart={handleStart} language={language} />
    </div>
  )
}

export default App