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
      disbursements: [],
      transactions: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
};

// Read database
const readDatabase = () => {
  if (!fs.existsSync(dbPath)) {
    initDatabase();
  }
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

// Write database
const writeDatabase = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User functions
const createUser = async (userData) => {
  const db = readDatabase();
  const { username, email, password, fullName, phone, address, occupation, role } = userData;
  
  // Check if user already exists
  const existingUser = db.users.find(user => user.username === username || user.email === email);
  if (existingUser) {
    throw new Error('Username or email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const newUser = {
    id: generateId(),
    username,
    email,
    password: hashedPassword,
    fullName: fullName || '',
    phone: phone || '',
    address: address || '',
    occupation: occupation || '',
    role: role || 'user',
    createdAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  writeDatabase(db);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

const findUser = async (username, password) => {
  const db = readDatabase();
  const user = db.users.find(user => user.username === username || user.email === username);
  
  if (user && await bcrypt.compare(password, user.password)) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

const getUserById = (userId) => {
  const db = readDatabase();
  const user = db.users.find(user => user.id === userId);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

const getAllUsers = () => {
  const db = readDatabase();
  return db.users.map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

const updateUserProfile = (userId, profileData) => {
  const db = readDatabase();
  const userIndex = db.users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Update user profile
  db.users[userIndex] = {
    ...db.users[userIndex],
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  writeDatabase(db);
  
  const { password: _, ...userWithoutPassword } = db.users[userIndex];
  return userWithoutPassword;
};

// Document functions
const createDocument = async (documentData) => {
  const db = readDatabase();
  const { userId, name, type, path, size } = documentData;
  
  // Verify user exists
  const user = db.users.find(user => user.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Create new document
  const newDocument = {
    id: generateId(),
    userId,
    name,
    type,
    path,
    size,
    uploadedAt: new Date().toISOString()
  };
  
  db.documents.push(newDocument);
  writeDatabase(db);
  
  return newDocument;
};

const getDocumentsByUserId = (userId) => {
  const db = readDatabase();
  return db.documents.filter(document => document.userId === userId);
};

// Assessment functions
const createAssessment = (assessmentData) => {
  const db = readDatabase();
  const { userId, score, decision, loanAmount, reasons } = assessmentData;
  
  // Verify user exists
  const user = db.users.find(user => user.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Create new assessment
  const newAssessment = {
    id: generateId(),
    userId,
    score,
    decision,
    loanAmount,
    reasons,
    createdAt: new Date().toISOString()
  };
  
  db.assessments.push(newAssessment);
  
  // Update user's credit score
  const userIndex = db.users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    db.users[userIndex].creditScore = score;
    db.users[userIndex].assessed = true;
  }
  
  writeDatabase(db);
  
  return newAssessment;
};

const getAssessmentsByUserId = (userId) => {
  const db = readDatabase();
  return db.assessments.filter(assessment => assessment.userId === userId);
};

// Disbursement functions
const createDisbursement = (disbursementData) => {
  const db = readDatabase();
  const { userId, amount, status } = disbursementData;
  
  // Verify user exists
  const user = db.users.find(user => user.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Create new disbursement
  const newDisbursement = {
    id: generateId(),
    userId,
    amount,
    status: status || 'pending',
    createdAt: new Date().toISOString()
  };
  
  db.disbursements.push(newDisbursement);
  writeDatabase(db);
  
  return newDisbursement;
};

const getDisbursementsByUserId = (userId) => {
  const db = readDatabase();
  return db.disbursements.filter(disbursement => disbursement.userId === userId);
};

// Transaction functions
const createTransaction = (transactionData) => {
  const db = readDatabase();
  const { userId, type, amount, description, category } = transactionData;
  
  // Verify user exists
  const user = db.users.find(user => user.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Create new transaction
  const newTransaction = {
    id: generateId(),
    userId,
    type,
    amount,
    description,
    category: category || 'other',
    date: new Date().toISOString()
  };
  
  db.transactions.push(newTransaction);
  writeDatabase(db);
  
  return newTransaction;
};

const getTransactionsByUserId = (userId) => {
  const db = readDatabase();
  return db.transactions.filter(transaction => transaction.userId === userId);
};

// Initialize database on module load
initDatabase();

module.exports = {
  createUser,
  findUser,
  getUserById,
  getAllUsers,
  updateUserProfile,
  createDocument,
  getDocumentsByUserId,
  createAssessment,
  getAssessmentsByUserId,
  createDisbursement,
  getDisbursementsByUserId,
  createTransaction,
  getTransactionsByUserId
};