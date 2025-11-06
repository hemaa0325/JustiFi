const API_BASE_URL = 'http://localhost:52093/api';

// Function to get all users (for banker dashboard)
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/banker/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch users');
    }
    
    return data.users;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to get user details with credit score
export const getUserDetails = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/banker/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user details');
    }
    
    return data.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to get user documents
export const getUserDocuments = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/banker/documents/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user documents');
    }
    
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
    
    const response = await fetch(`${API_BASE_URL}/banker/documents/download/${docId}`, {
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