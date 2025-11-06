const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file paths
const dbPath = path.join(__dirname, '..', 'data', 'database.json');

// Initialize database
const initDatabase = () => {
  if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
  }
  
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [],
      documents: [],
      assessments: [],
      disbursements: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
};

// Load database
const loadDatabase = () => {
  if (!fs.existsSync(dbPath)) {
    initDatabase();
  }
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

// Save database
const saveDatabase = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Function to create a new user
const createUser = async (userData) => {
  const db = loadDatabase();
  const { username, email, password, fullName, phone, address, occupation, role = 'user' } = userData;
  
  // Check if user already exists
  const existingUser = db.users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    throw new Error('Username or email already exists');
  }
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const newUser = {
    id: db.users.length + 1,
    username,
    email,
    password: hashedPassword,
    full_name: fullName || '',
    phone: phone || '',
    address: address || '',
    occupation: occupation || '',
    role,
    created_at: new Date().toISOString()
  };
  
  db.users.push(newUser);
  saveDatabase(db);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Function to find a user by username or email
const findUser = (identifier) => {
  const db = loadDatabase();
  return db.users.find(u => u.username === identifier || u.email === identifier);
};

// Function to verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Function to get user by ID
const getUserById = (id) => {
  const db = loadDatabase();
  return db.users.find(u => u.id == id);
};

// Function to get all users
const getAllUsers = () => {
  const db = loadDatabase();
  return db.users;
};

// Function to update user profile
const updateUserProfile = (userId, userData) => {
  const db = loadDatabase();
  const userIndex = db.users.findIndex(u => u.id == userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Update user data
  db.users[userIndex] = {
    ...db.users[userIndex],
    ...userData,
    updated_at: new Date().toISOString()
  };
  
  saveDatabase(db);
  
  // Return updated user without password
  const { password: _, ...userWithoutPassword } = db.users[userIndex];
  return userWithoutPassword;
};

// Function to delete a user
const deleteUser = (userId) => {
  const db = loadDatabase();
  const userIndex = db.users.findIndex(u => u.id == userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  db.users.splice(userIndex, 1);
  saveDatabase(db);
};

// Function to save document information
const saveDocument = (documentData) => {
  const db = loadDatabase();
  const { userId, filename, originalName, filePath, fileSize, mimeType } = documentData;
  
  const newDocument = {
    id: db.documents.length + 1,
    user_id: userId,
    filename,
    original_name: originalName,
    file_path: filePath,
    file_size: fileSize,
    mime_type: mimeType,
    upload_date: new Date().toISOString()
  };
  
  db.documents.push(newDocument);
  saveDatabase(db);
  
  return newDocument;
};

// Function to get user documents
const getUserDocuments = (userId) => {
  const db = loadDatabase();
  return db.documents.filter(doc => doc.user_id == userId);
};

// Function to save assessment result
const saveAssessment = (assessmentData) => {
  const db = loadDatabase();
  const { userId, creditScore, creditDecision, loanAmount, message, reasons } = assessmentData;
  
  const newAssessment = {
    id: db.assessments.length + 1,
    user_id: userId,
    credit_score: creditScore,
    credit_decision: creditDecision,
    loan_amount: loanAmount,
    message,
    reasons: JSON.stringify(reasons),
    created_at: new Date().toISOString()
  };
  
  db.assessments.push(newAssessment);
  saveDatabase(db);
  
  return {
    ...newAssessment,
    reasons: JSON.parse(newAssessment.reasons)
  };
};

// Function to get user assessments
const getUserAssessments = (userId) => {
  const db = loadDatabase();
  const assessments = db.assessments.filter(ass => ass.user_id == userId);
  return assessments.map(ass => ({
    ...ass,
    reasons: JSON.parse(ass.reasons)
  }));
};

// Function to save disbursement
const saveDisbursement = (disbursementData) => {
  const db = loadDatabase();
  const { userId, amount, accountNumber, bankName } = disbursementData;
  
  const newDisbursement = {
    id: db.disbursements.length + 1,
    user_id: userId,
    amount,
    account_number: accountNumber,
    bank_name: bankName,
    status: 'processing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.disbursements.push(newDisbursement);
  saveDatabase(db);
  
  return newDisbursement;
};

// Function to get user disbursements
const getUserDisbursements = (userId) => {
  const db = loadDatabase();
  return db.disbursements.filter(disb => disb.user_id == userId);
};

// Initialize database on module load
initDatabase();

module.exports = {
  createUser,
  findUser,
  verifyPassword,
  getUserById,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  saveDocument,
  getUserDocuments,
  saveAssessment,
  getUserAssessments,
  saveDisbursement,
  getUserDisbursements
};