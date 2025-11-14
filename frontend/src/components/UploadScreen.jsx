import React, { useState, useEffect } from 'react';
import '../styles/UploadScreen.css';
import CreditScoreAnalysis from './CreditScoreAnalysis';
import { t } from '../utils/localization';
import { getCurrentUser } from '../services/authService';

const API_BASE_URL = '/api'; // Use relative path to match backend

const UploadScreen = ({ onAssessmentComplete, language, onBackToProfile, userId }) => {
  const [salaryReceipt, setSalaryReceipt] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [idDocumentType, setIdDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({
    salaryReceipt: false,
    bankStatement: false,
    idDocument: false
  });
  const [uploadedFileIds, setUploadedFileIds] = useState({
    salaryReceipt: null,
    bankStatement: null,
    idDocument: null
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

  const handleIdDocumentChange = (event) => {
    const selectedFile = event.target.files[0];
    setIdDocument(selectedFile);
    setUploadStatus('');
    setCreditScoreResult(null); // Reset analysis when new file is selected
    // Reset upload status when new file is selected
    setUploadedFiles(prev => ({ ...prev, idDocument: false }));
    setUploadedFileIds(prev => ({ ...prev, idDocument: null }));
  };

  const handleSalaryReceiptUpload = async () => {
    if (!salaryReceipt) {
      setUploadStatus(t('please_select_file', language));
      return;
    }

    // Check if user is logged in
    if (!userId) {
      setUploadStatus(t('user_not_authenticated', language));
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    try {
      const formData = new FormData();
      formData.append('document', salaryReceipt);
      formData.append('type', 'salary_receipt');
      
      // Use the passed userId
      formData.append('userId', userId);

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

    // Check if user is logged in
    if (!userId) {
      setUploadStatus(t('user_not_authenticated', language));
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    try {
      const formData = new FormData();
      formData.append('document', bankStatement);
      formData.append('type', 'bank_statement');
      
      // Use the passed userId
      formData.append('userId', userId);

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

  const handleIdDocumentUpload = async () => {
    if (!idDocument) {
      setUploadStatus(t('please_select_file', language));
      return;
    }

    // Check if user is logged in
    if (!userId) {
      setUploadStatus(t('user_not_authenticated', language));
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    try {
      const formData = new FormData();
      formData.append('document', idDocument);
      formData.append('type', idDocumentType || 'id_document');
      
      // Use the passed userId
      formData.append('userId', userId);

      const response = await fetch(`${API_BASE_URL}/assess/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('error_processing_request', language));
      }

      setUploadedFiles(prev => ({ ...prev, idDocument: true }));
      setUploadedFileIds(prev => ({ ...prev, idDocument: result.document.id }));
      setUploadStatus(t('id_document_uploaded_successfully', language));
    } catch (error) {
      console.error('Error uploading ID document:', error);
      setUploadStatus(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssessment = async () => {
    // Check if at least one document is uploaded
    if (!uploadedFiles.salaryReceipt && !uploadedFiles.bankStatement && !uploadedFiles.idDocument) {
      setUploadStatus(t('please_upload_at_least_one_document', language));
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
    <div className="app-container">
      <div className="upload-screen">
        <div className="card">
        <div className="header">
          <button className="back-button btn btn-secondary" onClick={onBackToProfile}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>
          <h1 className="page-title">{t('upload_documents', language)}</h1>
        </div>
        
        <div className="upload-content">
          <div className="upload-section">
            <h2 className="section-title">{t('upload_salary_receipt', language)}</h2>
            <div className="file-upload-area">
              <input 
                type="file" 
                id="salary-receipt" 
                onChange={handleSalaryReceiptChange} 
                accept=".pdf,.jpg,.jpeg,.png"
                className="file-input"
              />
              <label htmlFor="salary-receipt" className="file-label btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                {t('choose_file', language)}
              </label>
              {salaryReceipt && (
                <p className="file-name">{salaryReceipt.name}</p>
              )}
              <button 
                onClick={handleSalaryReceiptUpload} 
                className="upload-button btn btn-primary"
                disabled={!salaryReceipt || isUploading}
              >
                {isUploading && uploadedFiles.salaryReceipt === false ? t('uploading', language) : t('upload', language)}
              </button>
            </div>
          </div>

          <div className="upload-section">
            <h2 className="section-title">{t('upload_bank_statement', language)}</h2>
            <div className="file-upload-area">
              <input 
                type="file" 
                id="bank-statement" 
                onChange={handleBankStatementChange} 
                accept=".pdf,.jpg,.jpeg,.png"
                className="file-input"
              />
              <label htmlFor="bank-statement" className="file-label btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                {t('choose_file', language)}
              </label>
              {bankStatement && (
                <p className="file-name">{bankStatement.name}</p>
              )}
              <button 
                onClick={handleBankStatementUpload} 
                className="upload-button btn btn-primary"
                disabled={!bankStatement || isUploading}
              >
                {isUploading && uploadedFiles.bankStatement === false ? t('uploading', language) : t('upload', language)}
              </button>
            </div>
          </div>

          <div className="upload-section">
            <h2 className="section-title">{t('upload_either_aadhar_or_pan', language)}</h2>
            <div className="file-upload-area">
              <select 
                value={idDocumentType}
                onChange={(e) => setIdDocumentType(e.target.value)}
                className="document-type-select"
              >
                <option value="">{t('select_document_type', language)}</option>
                <option value="aadhar_card">{t('aadhar_card', language)}</option>
                <option value="pan_card">{t('pan_card', language)}</option>
              </select>
              <input 
                type="file" 
                id="id-document" 
                onChange={handleIdDocumentChange} 
                accept=".pdf,.jpg,.jpeg,.png"
                className="file-input"
              />
              <label htmlFor="id-document" className="file-label btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                {t('choose_file', language)}
              </label>
              {idDocument && (
                <p className="file-name">{idDocument.name}</p>
              )}
              <button 
                onClick={handleIdDocumentUpload} 
                className="upload-button btn btn-primary"
                disabled={!idDocument || !idDocumentType || isUploading}
              >
                {isUploading && uploadedFiles.idDocument === false ? t('uploading', language) : t('upload', language)}
              </button>
            </div>
          </div>

          {uploadStatus && (
            <div className={`status-message ${uploadStatus.includes('success') ? 'success' : 'error'}`}>
              {uploadStatus}
            </div>
          )}

          <button 
            onClick={handleAssessment} 
            className="assess-button btn btn-primary"
            disabled={!uploadedFiles.salaryReceipt && !uploadedFiles.bankStatement && !uploadedFiles.idDocument || isUploading}
          >
            {isUploading ? t('analyzing', language) : t('perform_assessment', language)}
          </button>
        </div>

        {creditScoreResult && (
          <div className="analysis-section">
            <h2 className="section-title">{t('credit_analysis', language)}</h2>
            <CreditScoreAnalysis result={creditScoreResult} language={language} />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;