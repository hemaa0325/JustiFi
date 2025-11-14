const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findUserWithPassword, verifyPassword, getUserById, getAllUsers, updateUserProfile, logActivity, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } = require('../db/fileDatabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { username, email, password, fullName, phone, address, occupation } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  try {
    // Create user with forced role: "user"
    // Ignore any role sent from frontend and always assign "user"
    const user = await createUser({ 
      username, 
      email, 
      password, 
      fullName, 
      phone, 
      address, 
      occupation, 
      role: 'user' // Force role to "user" regardless of what frontend sends
    });
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Log the signup action
    await logActivity(user.id, user.role, 'USER_SIGNUP', null, { username: user.username, email: user.email });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.name, // Changed from user.fullName to user.name
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
    // Find user by username or email (with password)
    const user = await findUserWithPassword(identifier);
    if (!user) {
      // Log failed login attempt
      await logActivity(null, 'anonymous', 'FAILED_LOGIN', null, { identifier, reason: 'User not found' });
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      await logActivity(user.id, user.role, 'FAILED_LOGIN', null, { identifier, reason: 'Invalid password' });
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Log successful login
    await logActivity(user.id, user.role, 'SUCCESSFUL_LOGIN', null, { username: user.username });
    
    // Return user data without password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.name, // Changed from user.fullName to user.name
      phone: user.phone || '',
      address: user.address || '',
      occupation: user.occupation || '',
      role: user.role
    };
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
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
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log profile view
    await logActivity(userId, 'user', 'VIEW_PROFILE', null, { profileUserId: userId });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.name, // Changed from user.fullName to user.name
        phone: user.phone || '',
        address: user.address || '',
        occupation: user.occupation || '',
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
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is a banker or admin
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    // Get all users
    try {
      const users = await getAllUsers();
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'VIEW_ALL_USERS', null, { count: users.length });
      
      res.json({
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.name, // Changed from user.fullName to user.name
          phone: user.phone || '',
          address: user.address || '',
          occupation: user.occupation || '',
          role: user.role,
          created_at: user.created_at
        }))
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
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
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is authorized to update this profile
    if (decoded.userId != userId && decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }
    
    // Update user profile
    try {
      const updatedUser = await updateUserProfile(userId, { 
        name: fullName, // Changed from fullName to name
        email, 
        phone, 
        address, 
        occupation 
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Log the profile update
      await logActivity(decoded.userId, decoded.role, 'UPDATE_USER_PROFILE', null, { 
        updatedUserId: userId, 
        updatedFields: { fullName, email, phone, address, occupation } 
      });
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.name, // Changed from updatedUser.fullName to updatedUser.name
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          occupation: updatedUser.occupation || '',
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

// Get user notifications
router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user notifications
    const notifications = await getUserNotifications(userId);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message || 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;
  
  try {
    const updatedNotification = await markNotificationAsRead(notificationId);
    
    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error.message === 'Notification not found') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(500).json({ error: error.message || 'Error marking notification as read' });
  }
});

// Mark all notifications as read
router.put('/notifications/:userId/read-all', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedNotifications = await markAllNotificationsAsRead(userId);
    
    res.json({
      message: 'All notifications marked as read',
      notifications: updatedNotifications
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message || 'Error marking all notifications as read' });
  }
});

module.exports = router;