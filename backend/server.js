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

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Create new user
    const newUser = await createUser({ username, email, password, fullName, role });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.message === 'Username or email already exists') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by username or email
    const user = findUser(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile endpoint
app.get('/api/auth/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user by ID
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile endpoint
app.put('/api/auth/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Update user data (excluding sensitive fields)
    const updatedUser = updateUserProfile(userId, updates);
    
    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`JustiFi backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});