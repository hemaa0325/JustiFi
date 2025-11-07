import React, { useState, useEffect } from 'react';
import '../styles/UploadScreen.css';
import CreditScoreAnalysis from './CreditScoreAnalysis';
import { t } from '../utils/localization';
import { getCurrentUser } from '../services/authService';

const API_BASE_URL = '/api'; // Use relative path to match backend

const UploadScreen = ({ onAssessmentComplete, language, onBackToProfile }) => {
  const [salaryReceipt, setSalaryReceipt] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({
    salaryReceipt: false,
    bankStatement: false
  });
  const [uploadedFileIds, setUploadedFileIds] = useState({
    salaryReceipt: null,
    bankStatement: null
  });
  const [creditScoreResult, setCreditScoreResult] = useState(null);

  // Fetch demo users on component mount
  useEffect(() => {
    fetchDemoUsers();
  }, []);

  const fetchDemoUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assess/demo-users`);
      const users = await response.json();
      setDemoUsers(users);
    } catch (error) {
      console.error('Error fetching demo users:', error);
    }
  };

  const handleSalaryReceiptChange = (event) => {
    const selectedFile = event.target.files[0];
    setSalaryReceipt(selectedFile);
    setUploadStatus('');
    setCreditScoreResult(null); // Reset analysis when new file is selected
    // Reset upload status when new file is selected
    setUploadedFiles(prev => ({ ...prev, salaryReceipt: false }));
    setUploadedFileIds(prev => ({ ...prev, salaryReceipt: null }));
  };

  const handleBankStatementChange = (event) => {
    const selectedFile = event.target.files[0];
    setBankStatement(selectedFile);
    setUploadStatus('');
    setCreditScoreResult(null); // Reset analysis when new file is selected
    // Reset upload status when new file is selected
    setUploadedFiles(prev => ({ ...prev, bankStatement: false }));
    setUploadedFileIds(prev => ({ ...prev, bankStatement: null }));
  };

  const handleSalaryReceiptUpload = async () => {
    if (!salaryReceipt) {
      setUploadStatus(t('please_select_file', language));
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    try {
      const formData = new FormData();
      formData.append('document', salaryReceipt);
      formData.append('type', 'salary_receipt');
      
      // Get current user ID to associate with the document
      const currentUser = getCurrentUser();
      if (currentUser) {
        formData.append('userId', currentUser.id);
      }

      const response = await fetch(`${API_BASE_URL}/assess/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('error_processing_request', language));
      }

      setUploadedFiles(prev => ({ ...prev, salaryReceipt: true }));
      setUploadedFileIds(prev => ({ ...prev, salaryReceipt: result.document.id }));
      setUploadStatus(t('salary_receipt_uploaded_successfully', language));
    } catch (error) {
      console.error('Error uploading salary receipt:', error);
      setUploadStatus(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBankStatementUpload = async () => {
    if (!bankStatement) {
      setUploadStatus(t('please_select_file', language));
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    try {
      const formData = new FormData();
      formData.append('document', bankStatement);
      formData.append('type', 'bank_statement');
      
      // Get current user ID to associate with the document
      const currentUser = getCurrentUser();
      if (currentUser) {
        formData.append('userId', currentUser.id);
      }

      const response = await fetch(`${API_BASE_URL}/assess/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('error_processing_request', language));
      }

      setUploadedFiles(prev => ({ ...prev, bankStatement: true }));
      setUploadedFileIds(prev => ({ ...prev, bankStatement: result.document.id }));
      setUploadStatus(t('bank_statement_uploaded_successfully', language));
    } catch (error) {
      console.error('Error uploading bank statement:', error);
      setUploadStatus(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssessment = async () => {
    // Check if both documents are uploaded
    if (!uploadedFiles.salaryReceipt || !uploadedFiles.bankStatement) {
      setUploadStatus(t('please_upload_both_documents', language));
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    try {
      // Get current user ID to associate with the assessment
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error(t('user_not_authenticated', language));
      }

      const response = await fetch(`${API_BASE_URL}/assess/user/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('error_processing_request', language));
      }

      setCreditScoreResult(result);
      if (onAssessmentComplete) {
        onAssessmentComplete(result);
      }
    } catch (error) {
      console.error('Error during assessment:', error);
      setUploadStatus(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
    setUploadStatus('');
  };

  return (
    <div className="upload-screen">
      <div className="header">
        <button className="back-button" onClick={onBackToProfile}>←</button>
        <h1>{t('upload_documents', language)}</h1>
      </div>
      
      {/* Show upload options only if analysis is not yet shown */}
      {!creditScoreResult && (
        <>
          <div className="upload-options">
            {/* Salary Receipt Upload */}
            <div className="upload-option">
              <h2>{t('upload_salary_receipt', language)}</h2>
              <p>{t('upload_salary_receipt_description', language)}</p>
              
              <label className="file-input-label">
                {salaryReceipt ? salaryReceipt.name : t('choose_salary_receipt', language)}
                <input 
                  type="file" 
                  onChange={handleSalaryReceiptChange} 
                  accept=".jpg,.jpeg,.png,.pdf"
                />
              </label>
              
              <button 
                className="secondary-button" 
                onClick={handleSalaryReceiptUpload}
                disabled={isUploading || !salaryReceipt || uploadedFiles.salaryReceipt}
              >
                {isUploading ? t('uploading', language) : 
                 uploadedFiles.salaryReceipt ? t('uploaded', language) : 
                 t('upload_salary_receipt_button', language)}
              </button>
              
              {uploadedFiles.salaryReceipt && (
                <div className="confirmation-message">
                  ✓ {t('salary_receipt_uploaded_successfully', language)}
                </div>
              )}
            </div>

            {/* Bank Statement Upload */}
            <div className="upload-option">
              <h2>{t('upload_bank_statement', language)}</h2>
              <p>{t('upload_bank_statement_description', language)}</p>
              
              <label className="file-input-label">
                {bankStatement ? bankStatement.name : t('choose_bank_statement', language)}
                <input 
                  type="file" 
                  onChange={handleBankStatementChange} 
                  accept=".jpg,.jpeg,.png,.pdf"
                />
              </label>
              
              <button 
                className="secondary-button" 
                onClick={handleBankStatementUpload}
                disabled={isUploading || !bankStatement || uploadedFiles.bankStatement}
              >
                {isUploading ? t('uploading', language) : 
                 uploadedFiles.bankStatement ? t('uploaded', language) : 
                 t('upload_bank_statement_button', language)}
              </button>
              
              {uploadedFiles.bankStatement && (
                <div className="confirmation-message">
                  ✓ {t('bank_statement_uploaded_successfully', language)}
                </div>
              )}
            </div>
          </div>

          {/* Demo Data Option */}
          <div className="demo-section">
            <p>{t('or_try_demo', language)}</p>
            <div className="demo-user-selection">
              <h3>{t('select_demo_user', language)}</h3>
              <select value={selectedUser} onChange={handleUserChange}>
                <option value="">{t('please_select_demo_user', language)}</option>
                {demoUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.riskLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus && (
            <div className={`upload-status ${uploadStatus.includes('successfully') ? 'success' : 'error'}`}>
              {uploadStatus}
            </div>
          )}

          {/* Action Button */}
          <button 
            className="primary-button" 
            onClick={handleAssessment}
            disabled={isUploading || !uploadedFiles.salaryReceipt || !uploadedFiles.bankStatement}
          >
            {isUploading ? t('processing', language) : t('calculate_my_score', language)}
          </button>

          {/* Privacy Note */}
          <div className="privacy-note">
            {t('no_pan_aadhaar_required', language)}
          </div>
        </>
      )}

      {/* Show credit score analysis if result is available */}
      {creditScoreResult && (
        <CreditScoreAnalysis 
          result={creditScoreResult} 
          onRestart={() => {
            setCreditScoreResult(null);
            setUploadedFiles({ salaryReceipt: false, bankStatement: false });
            setUploadedFileIds({ salaryReceipt: null, bankStatement: null });
            setSalaryReceipt(null);
            setBankStatement(null);
          }}
          language={language}
        />
      )}
    </div>
  );
};

export default UploadScreen;