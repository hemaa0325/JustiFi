const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { createUser, findUser, getUserById, getAllUsers, updateUserProfile } = require('./db/fileDatabase');
const PORT = 52093; // Changed port to avoid conflicts

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

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
const JWT_SECRET = 'justifi_jwt_secret';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`JustiFi backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});