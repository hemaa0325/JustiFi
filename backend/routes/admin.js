const express = require('express');
const jwt = require('jsonwebtoken');
const { 
  getAllUsers, 
  getActivityLogs,
  logActivity
} = require('../db/fileDatabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Get all users
router.get('/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      const users = await getAllUsers();
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'ADMIN_VIEW_ALL_USERS', null, { userCount: users.length });
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  });
});

// Get activity logs (admin only)
router.get('/activity-logs', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      // Extract query parameters for filtering
      const { userId, role, action, startDate, endDate, limit, offset } = req.query;
      
      const filters = {
        userId,
        role,
        action,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0
      };
      
      const logs = await getActivityLogs(filters);
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'ADMIN_VIEW_ACTIVITY_LOGS', null, { filter: filters });
      
      res.json(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ error: 'Error fetching activity logs' });
    }
  });
});

// Get activity log statistics
router.get('/activity-stats', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      // In a real implementation, we would get statistics from the database
      // For now, we'll return mock data
      
      const stats = {
        totalLogs: 1250,
        logsByAction: {
          'LOGIN': 320,
          'UPLOAD_DOC': 180,
          'CREATE_ASSESSMENT': 95,
          'UPDATE_STATUS': 75,
          'MODIFY_DATA': 140,
          'VIEW_PROFILE': 210,
          'VIEW_DOCUMENTS': 110,
          'CREATE_USER': 120
        },
        logsByRole: {
          'user': 780,
          'banker': 320,
          'admin': 150
        },
        recentActivity: [
          { action: 'LOGIN', user: 'john_doe', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
          { action: 'UPLOAD_DOC', user: 'jane_smith', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
          { action: 'CREATE_ASSESSMENT', user: 'banker1', timestamp: new Date(Date.now() - 1000 * 60 * 30) }
        ]
      };
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'ADMIN_VIEW_ACTIVITY_STATS', null, {});
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      res.status(500).json({ error: 'Error fetching activity stats' });
    }
  });
});

module.exports = router;