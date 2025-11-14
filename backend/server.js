require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// File-based database initialization
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const PORT = process.env.PORT || 52095; // Changed from 52094 to 52095

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Initialize database
const init = async () => {
  try {
    console.log('🚀 Initializing file-based database...');
    
    // Ensure all required data files exist
    const requiredFiles = [
      'users.json',
      'documents.json',
      'assessments.json',
      'transactions.json',
      'activity_logs.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        console.log(`✅ Created ${file}`);
      }
    }
    
    console.log('✅ File-based database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Import routes
const authRoutes = require('./routes/auth');
const bankerRoutes = require('./routes/banker');
const adminRoutes = require('./routes/admin');
const assessRoutes = require('./routes/assess');
const disburseRoutes = require('./routes/disburse');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/banker', bankerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assess', assessRoutes);
app.use('/api/disburse', disburseRoutes);

// JWT secret (in a real app, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'justifi_jwt_secret';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'File-based'
  });
});

// Serve frontend app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// Initialize database and start server
init().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 JustiFi backend server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💾 Database: File-based`);
    console.log(`\n📄 API Documentation:`);
    console.log(`   Authentication: POST /api/auth/signup, POST /api/auth/login`);
    console.log(`   Assessment: POST /api/assess/upload, POST /api/assess/user/:userId`);
    console.log(`   Banker: GET /api/banker/users, POST /api/banker/assess/:userId`);
    console.log(`   Admin: GET /api/admin/activity-logs`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});