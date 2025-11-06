const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getAllUsers, getUserById, updateUserProfile, deleteUser } = require('../db/fileDatabase');

const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Get all users (for admin dashboard)
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
    
    // Check if user is an admin
    if (decoded.role !== 'admin') {
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

// Get user details by ID
router.get('/users/:userId', (req, res) => {
  // Verify JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    const { userId } = req.params;
    
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        occupation: user.occupation,
        role: user.role,
        created_at: user.created_at
      }
    });
  });
});

// Update user details
router.put('/users/:userId', (req, res) => {
  // Verify JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated
    const { id, username, role, created_at, ...allowedUpdates } = updates;
    
    try {
      const updatedUser = updateUserProfile(userId, allowedUpdates);
      
      res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          occupation: updatedUser.occupation,
          role: updatedUser.role
        },
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Error updating user' });
    }
  });
});

// Delete user
router.delete('/users/:userId', (req, res) => {
  // Verify JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    const { userId } = req.params;
    
    // Prevent deleting admin users
    const userToDelete = getUserById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }
    
    try {
      deleteUser(userId);
      res.json({
        message: `User with ID ${userId} deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  });
});

module.exports = router;