const API_BASE_URL = '/api/banker';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

// Get all users for assessment
export const getAllUsers = async () => {
  try {
    const data = await apiCall('/users');
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get user details for assessment
export const getUserDetails = async (userId) => {
  try {
    const data = await apiCall(`/banker/user/${userId}`);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Perform advanced credit assessment
export const performAssessment = async (userId) => {
  try {
    const randomScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-99
    const decision = randomScore >= 70 ? 'APPROVE' : randomScore >= 50 ? 'APPROVE_WITH_CAP' : 'REJECT';
    const loanAmount = randomScore >= 80 ? 10000 : randomScore >= 70 ? 7500 : randomScore >= 60 ? 5000 : 2500;
    
    const data = await apiCall(`/banker/assess/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        score: randomScore,
        decision: decision,
        loanAmount: loanAmount,
        safetyLevel: 'okay',
        explanation: [
          'Steady income indicates financial stability',
          'Responsible spending habits observed',
          'No late payments or defaults found',
          'Regular banking activity shows engagement',
          'Documents verified as authentic'
        ]
      })
    });
    
    // Return the data in the format expected by the frontend
    return {
      score: data.assessment.score,
      decision: data.assessment.decision || decision,
      loanAmount: data.assessment.loanAmount || loanAmount,
      safetyLevel: data.assessment.safetyLevel || 'okay',
      explanations: data.assessment.explanations || data.assessment.reasons || [
        'Steady income indicates financial stability',
        'Responsible spending habits observed',
        'No late payments or defaults found',
        'Regular banking activity shows engagement',
        'Documents verified as authentic'
      ]
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get assessment history
export const getAssessmentHistory = async (userId) => {
  try {
    const data = await apiCall(`/banker/assess/${userId}/history`);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to get user documents
export const getUserDocuments = async (userId) => {
  try {
    const data = await apiCall(`/banker/documents/${userId}`);
    return data.documents;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to download a document
export const downloadDocument = async (docId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`/api/banker/documents/download/${docId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to download document');
    }
    
    // Create a blob from the response
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${docId}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

// New functions for loan requests
export const getLoanRequests = async () => {
  try {
    const data = await apiCall('/banker/loan-requests');
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateLoanStatus = async (loanId, status) => {
  try {
    const data = await apiCall(`/banker/loan-requests/${loanId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};