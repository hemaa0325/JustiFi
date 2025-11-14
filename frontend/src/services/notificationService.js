const API_BASE_URL = '/api'; // Use relative path to match backend

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

// Function to get user notifications
export const getUserNotifications = async (userId) => {
  try {
    const data = await apiCall(`/auth/notifications/${userId}`);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const data = await apiCall(`/auth/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const data = await apiCall(`/auth/notifications/${userId}/read-all`, {
      method: 'PUT'
    });
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};