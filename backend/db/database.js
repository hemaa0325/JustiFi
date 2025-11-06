const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Create or connect to the database
const dbPath = path.join(__dirname, '..', 'data', 'justifi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      address TEXT,
      occupation TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready.');
      }
    });
    
    // Create sessions table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating sessions table:', err.message);
      } else {
        console.log('Sessions table ready.');
      }
    });
    
    // Create documents table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Error creating documents table:', err.message);
      } else {
        console.log('Documents table ready.');
      }
    });
    
    // Create assessments table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      credit_score INTEGER,
      credit_decision TEXT,
      loan_amount INTEGER,
      message TEXT,
      reasons TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Error creating assessments table:', err.message);
      } else {
        console.log('Assessments table ready.');
      }
    });
  }
});

// Function to create a new user
const createUser = (userData, callback) => {
  const { username, email, password, fullName, phone, address, occupation, role = 'user' } = userData;
  
  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return callback(err);
    }
    
    const sql = `INSERT INTO users (username, email, password, full_name, phone, address, occupation, role)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [username, email, hashedPassword, fullName, phone, address, occupation, role], function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, username, email, fullName, phone, address, occupation, role });
    });
  });
};

// Function to find a user by username or email
const findUser = (identifier, callback) => {
  const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;
  
  db.get(sql, [identifier, identifier], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
};

// Function to verify password
const verifyPassword = (password, hashedPassword, callback) => {
  bcrypt.compare(password, hashedPassword, callback);
};

// Function to get user by ID
const getUserById = (id, callback) => {
  const sql = `SELECT id, username, email, full_name, phone, address, occupation, role FROM users WHERE id = ?`;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
};

// Function to get all users (for banker dashboard)
const getAllUsers = (callback) => {
  const sql = `SELECT id, username, email, full_name, phone, address, occupation, role, created_at FROM users`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows);
  });
};

// Function to update user profile
const updateUserProfile = (userId, userData, callback) => {
  const { fullName, email, phone, address, occupation } = userData;
  const sql = `UPDATE users SET full_name = ?, email = ?, phone = ?, address = ?, occupation = ? WHERE id = ?`;
  
  db.run(sql, [fullName, email, phone, address, occupation, userId], function(err) {
    if (err) {
      return callback(err);
    }
    if (this.changes === 0) {
      return callback(new Error('User not found'));
    }
    callback(null, { id: userId, fullName, email, phone, address, occupation });
  });
};

// Function to delete a user
const deleteUser = (userId, callback) => {
  const sql = `DELETE FROM users WHERE id = ?`;
  
  db.run(sql, [userId], function(err) {
    if (err) {
      return callback(err);
    }
    if (this.changes === 0) {
      return callback(new Error('User not found'));
    }
    callback(null);
  });
};

// Function to save document information
const saveDocument = (documentData, callback) => {
  const { userId, filename, originalName, filePath, fileSize, mimeType } = documentData;
  const sql = `INSERT INTO documents (user_id, filename, original_name, file_path, file_size, mime_type)
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [userId, filename, originalName, filePath, fileSize, mimeType], function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID, userId, filename, originalName, filePath, fileSize, mimeType });
  });
};

// Function to get user documents
const getUserDocuments = (userId, callback) => {
  const sql = `SELECT id, filename, original_name, file_path, file_size, mime_type, upload_date 
               FROM documents WHERE user_id = ? ORDER BY upload_date DESC`;
  
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows);
  });
};

// Function to save assessment result
const saveAssessment = (assessmentData, callback) => {
  const { userId, creditScore, creditDecision, loanAmount, message, reasons } = assessmentData;
  const reasonsJson = JSON.stringify(reasons);
  const sql = `INSERT INTO assessments (user_id, credit_score, credit_decision, loan_amount, message, reasons)
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [userId, creditScore, creditDecision, loanAmount, message, reasonsJson], function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, { 
      id: this.lastID, 
      userId, 
      creditScore, 
      creditDecision, 
      loanAmount, 
      message, 
      reasons 
    });
  });
};

// Function to get user assessments
const getUserAssessments = (userId, callback) => {
  const sql = `SELECT id, credit_score, credit_decision, loan_amount, message, reasons, created_at 
               FROM assessments WHERE user_id = ? ORDER BY created_at DESC`;
  
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return callback(err);
    }
    // Parse reasons JSON
    const assessments = rows.map(row => ({
      ...row,
      reasons: JSON.parse(row.reasons)
    }));
    callback(null, assessments);
  });
};

module.exports = {
  createUser,
  findUser,
  verifyPassword,
  getUserById,
  getAllUsers,
  updateUserProfile,
  saveDocument,
  getUserDocuments,
  saveAssessment,
  getUserAssessments,
  deleteUser
};