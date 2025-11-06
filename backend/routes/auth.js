const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findUser, getUserById, getAllUsers, updateUserProfile, verifyPassword } = require('../db/fileDatabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { username, email, password, fullName, phone, address, occupation, role } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  try {
    // Create user
    const user = await createUser({ username, email, password, fullName, phone, address, occupation, role });
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        occupation: user.occupation,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message === 'Username or email already exists') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  // Validate required fields
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }
  
  try {
    // Find user by username or email
    const user = findUser(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        address: user.address,
        occupation: user.occupation,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Error verifying password' });
  }
});

// Get user profile endpoint
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        address: user.address,
        occupation: user.occupation,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Get all users endpoint (for bankers)
router.get('/users', (req, res) => {
  // Verify JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is a banker or admin
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    // Get all users
    const users = getAllUsers();
    
    res.json({
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        occupation: user.occupation,
        role: user.role,
        created_at: user.created_at
      }))
    });
  });
});

// Update user profile endpoint
router.put('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const { fullName, email, phone, address, occupation } = req.body;
  
  // Verify JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is authorized to update this profile
    if (decoded.userId != userId && decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }
    
    // Update user profile
    try {
      const updatedUser = updateUserProfile(userId, { fullName, email, phone, address, occupation });
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          occupation: updatedUser.occupation,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Error updating user profile' });
    }
  });
});

module.exports = router;