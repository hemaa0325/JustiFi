const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Data directory
const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper function to read data from a file
const readData = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data to a file
const writeData = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Log activity
const logActivity = async (userId, role, action, oldValue = null, newValue = null) => {
  try {
    const logs = readData('activity_logs.json');
    const id = generateId();
    const timestamp = new Date().toISOString();
    
    const newLog = {
      id,
      user_id: userId,
      role,
      action,
      old_value: oldValue,
      new_value: newValue,
      timestamp
    };
    
    logs.push(newLog);
    writeData('activity_logs.json', logs);
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

// User functions
const createUser = async (userData) => {
  const { username, email, password, fullName, phone, address, occupation } = userData;
  
  try {
    // Read existing users
    const users = readData('users.json');
    
    // Check if user already exists
    const existingUser = users.find(user => user.username === username || user.email === email);
    if (existingUser) {
      throw new Error('Username or email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with forced role: "user"
    const id = generateId();
    const createdAt = new Date().toISOString();
    
    const newUser = {
      id,
      username,
      email,
      name: fullName || username,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      occupation: occupation || '',
      role: 'user',
      created_at: createdAt,
      creditScore: null,
      assessed: false
    };
    
    users.push(newUser);
    writeData('users.json', users);
    
    // Log activity
    const { password: _, ...userWithoutPassword } = newUser;
    await logActivity(id, 'user', 'CREATE_USER', null, userWithoutPassword);
    
    // Return user without password
    const { password: __, ...userWithoutPassword2 } = newUser;
    return userWithoutPassword2;
  } catch (error) {
    throw error;
  }
};

const findUser = async (identifier) => {
  try {
    const users = readData('users.json');
    const user = users.find(u => u.username === identifier || u.email === identifier);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};

// Find user with password for authentication
const findUserWithPassword = async (identifier) => {
  try {
    const users = readData('users.json');
    return users.find(u => u.username === identifier || u.email === identifier) || null;
  } catch (error) {
    throw error;
  }
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const getUserById = async (userId) => {
  try {
    const users = readData('users.json');
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = readData('users.json');
    return users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    throw error;
  }
};

const updateUserProfile = async (userId, profileData) => {
  try {
    const users = readData('users.json');
    
    // Get current user data for logging
    const currentUserIndex = users.findIndex(u => u.id === userId);
    if (currentUserIndex === -1) {
      throw new Error('User not found');
    }
    
    const currentUser = { ...users[currentUserIndex] };
    const { password: _, ...currentUserWithoutPassword } = currentUser;
    
    // Update user profile
    Object.keys(profileData).forEach(key => {
      if (key !== 'id' && key !== 'role' && key !== 'created_at' && key !== 'password') {
        users[currentUserIndex][key] = profileData[key];
      }
    });
    
    writeData('users.json', users);
    
    // Get updated user
    const { password: __, ...updatedUserWithoutPassword } = users[currentUserIndex];
    
    // Log activity
    await logActivity(userId, users[currentUserIndex].role, 'UPDATE_PROFILE', currentUserWithoutPassword, updatedUserWithoutPassword);
    
    return updatedUserWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// Document functions
const createDocument = async (documentData) => {
  const { userId, name, type, path: docPath, size } = documentData;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Read existing documents
    const documents = readData('documents.json');
    
    // Create new document
    const id = generateId();
    const uploadedAt = new Date().toISOString();
    
    // Map document type to specific field
    let fieldMapping = {
      'salary_receipt': 'salary_receipt',
      'bank_statement': 'bank_statement',
      'aadhar_card': 'aadhar_card',
      'pan_card': 'pan_card',
      'aadhaar': 'aadhar_card',
      'pan': 'pan_card',
      'id_document': 'id_document'
    };
    
    const fieldName = fieldMapping[type] || type;
    
    const newDocument = {
      id,
      user_id: userId,
      [fieldName]: docPath,
      uploadedAt
    };
    
    documents.push(newDocument);
    writeData('documents.json', documents);
    
    // Log activity
    await logActivity(userId, 'user', 'UPLOAD_DOCUMENT', null, newDocument);
    
    return newDocument;
  } catch (error) {
    throw error;
  }
};

const getDocumentsByUserId = async (userId) => {
  try {
    const documents = readData('documents.json');
    return documents.filter(doc => doc.user_id === userId);
  } catch (error) {
    throw error;
  }
};

// Assessment functions
const createAssessment = async (assessmentData) => {
  const { userId, score, decision, loanAmount, reasons, safetyLevel, explanation } = assessmentData;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Read existing assessments
    const assessments = readData('assessments.json');
    
    // Create new assessment
    const id = generateId();
    const createdAt = new Date().toISOString();
    const riskLevel = safetyLevel || 'okay';
    
    const newAssessment = {
      id,
      user_id: userId,
      score,
      decision: decision || 'APPROVE',
      loanAmount: loanAmount || 5000,
      risk_level: riskLevel,
      reasons: reasons || explanation || {},
      created_at: createdAt
    };
    
    assessments.push(newAssessment);
    writeData('assessments.json', assessments);
    
    // Update user's credit score
    const users = readData('users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].creditScore = score;
      users[userIndex].assessed = true;
      writeData('users.json', users);
    }
    
    // Log activity
    await logActivity(userId, 'user', 'CREATE_ASSESSMENT', null, newAssessment);
    
    return newAssessment;
  } catch (error) {
    throw error;
  }
};

const getAssessmentsByUserId = async (userId) => {
  try {
    const assessments = readData('assessments.json');
    return assessments.filter(assessment => assessment.user_id === userId);
  } catch (error) {
    throw error;
  }
};

// Transaction functions
const createTransaction = async (transactionData) => {
  const { userId, type, amount, description, category } = transactionData;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Read existing transactions
    const transactions = readData('transactions.json');
    
    // Create new transaction
    const id = generateId();
    const createdAt = new Date().toISOString();
    const status = 'pending';
    
    const newTransaction = {
      id,
      user_id: userId,
      amount,
      status,
      created_at: createdAt
    };
    
    transactions.push(newTransaction);
    writeData('transactions.json', transactions);
    
    // Log activity
    await logActivity(userId, 'user', 'CREATE_TRANSACTION', null, newTransaction);
    
    return newTransaction;
  } catch (error) {
    throw error;
  }
};

const getTransactionsByUserId = async (userId) => {
  try {
    const transactions = readData('transactions.json');
    return transactions.filter(transaction => transaction.user_id === userId);
  } catch (error) {
    throw error;
  }
};

// Loan request functions
const createLoanRequest = async (loanData) => {
  const { userId, amount, assessmentId } = loanData;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Read existing loan requests
    const loanRequests = readData('loan_requests.json');
    
    // Create new loan request
    const id = generateId();
    const createdAt = new Date().toISOString();
    const status = 'pending'; // pending, approved, rejected, disbursed
    
    const newLoanRequest = {
      id,
      user_id: userId,
      amount,
      assessment_id: assessmentId,
      status,
      created_at: createdAt,
      updated_at: createdAt
    };
    
    loanRequests.push(newLoanRequest);
    writeData('loan_requests.json', loanRequests);
    
    // Log activity
    await logActivity(userId, 'user', 'CREATE_LOAN_REQUEST', null, newLoanRequest);
    
    return newLoanRequest;
  } catch (error) {
    throw error;
  }
};

const getLoanRequestsByUserId = async (userId) => {
  try {
    const loanRequests = readData('loan_requests.json');
    return loanRequests.filter(loan => loan.user_id === userId);
  } catch (error) {
    throw error;
  }
};

const getAllLoanRequests = async () => {
  try {
    const loanRequests = readData('loan_requests.json');
    return loanRequests;
  } catch (error) {
    throw error;
  }
};

const updateLoanRequestStatus = async (loanId, status, updatedBy, updatedByRole) => {
  try {
    const loanRequests = readData('loan_requests.json');
    const loanIndex = loanRequests.findIndex(loan => loan.id === loanId);
    
    if (loanIndex === -1) {
      throw new Error('Loan request not found');
    }
    
    // Store old status for logging
    const oldStatus = loanRequests[loanIndex].status;
    
    // Update loan request
    loanRequests[loanIndex].status = status;
    loanRequests[loanIndex].updated_at = new Date().toISOString();
    
    // If approved, add approved_by and approved_at
    if (status === 'approved') {
      loanRequests[loanIndex].approved_by = updatedBy;
      loanRequests[loanIndex].approved_at = new Date().toISOString();
    }
    
    // If disbursed, add disbursed_at
    if (status === 'disbursed') {
      loanRequests[loanIndex].disbursed_at = new Date().toISOString();
    }
    
    writeData('loan_requests.json', loanRequests);
    
    // Log activity
    await logActivity(
      loanRequests[loanIndex].user_id, 
      updatedByRole, 
      `UPDATE_LOAN_STATUS_${status.toUpperCase()}`, 
      { status: oldStatus }, 
      { status: status, updatedBy: updatedBy }
    );
    
    // Create notification for user when loan is approved
    if (status === 'approved') {
      await createNotification({
        userId: loanRequests[loanIndex].user_id,
        title: 'Loan Approved',
        message: `Your loan request for ₹${loanRequests[loanIndex].amount.toLocaleString()} has been approved!`,
        type: 'success'
      });
    }
    
    // Create notification for user when loan is rejected
    if (status === 'rejected') {
      await createNotification({
        userId: loanRequests[loanIndex].user_id,
        title: 'Loan Request Rejected',
        message: `Your loan request for ₹${loanRequests[loanIndex].amount.toLocaleString()} has been rejected.`,
        type: 'error'
      });
    }
    
    return loanRequests[loanIndex];
  } catch (error) {
    throw error;
  }
};

// Notification functions
const createNotification = async (notificationData) => {
  const { userId, title, message, type } = notificationData;
  
  try {
    // Read existing notifications
    const notifications = readData('notifications.json');
    
    // Create new notification
    const id = generateId();
    const createdAt = new Date().toISOString();
    
    const newNotification = {
      id,
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: createdAt
    };
    
    notifications.push(newNotification);
    writeData('notifications.json', notifications);
    
    return newNotification;
  } catch (error) {
    throw error;
  }
};

const getUserNotifications = async (userId) => {
  try {
    const notifications = readData('notifications.json');
    return notifications.filter(notification => notification.user_id === userId);
  } catch (error) {
    throw error;
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    const notifications = readData('notifications.json');
    const notificationIndex = notifications.findIndex(notification => notification.id === notificationId);
    
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }
    
    notifications[notificationIndex].read = true;
    notifications[notificationIndex].updated_at = new Date().toISOString();
    
    writeData('notifications.json', notifications);
    
    return notifications[notificationIndex];
  } catch (error) {
    throw error;
  }
};

const markAllNotificationsAsRead = async (userId) => {
  try {
    const notifications = readData('notifications.json');
    const userNotifications = notifications.filter(notification => notification.user_id === userId);
    
    userNotifications.forEach(notification => {
      const index = notifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        notifications[index].read = true;
        notifications[index].updated_at = new Date().toISOString();
      }
    });
    
    writeData('notifications.json', notifications);
    
    return userNotifications;
  } catch (error) {
    throw error;
  }
};

// Activity log functions
const getActivityLogs = async (filters = {}) => {
  try {
    let logs = readData('activity_logs.json');
    
    const { userId, role, action, startDate, endDate, limit = 100, offset = 0 } = filters;
    
    if (userId) {
      logs = logs.filter(log => log.user_id === userId);
    }
    
    if (role) {
      logs = logs.filter(log => log.role === role);
    }
    
    if (action) {
      logs = logs.filter(log => log.action === action);
    }
    
    if (startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(endDate));
    }
    
    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply limit and offset
    return logs.slice(offset, offset + limit);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  findUser,
  findUserWithPassword,
  verifyPassword,
  getUserById,
  getAllUsers,
  updateUserProfile,
  createDocument,
  getDocumentsByUserId,
  createAssessment,
  getAssessmentsByUserId,
  createTransaction,
  getTransactionsByUserId,
  createLoanRequest,
  getLoanRequestsByUserId,
  getAllLoanRequests,
  updateLoanRequestStatus,
  getActivityLogs,
  logActivity,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};