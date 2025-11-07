const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, getDocumentsByUserId, getTransactionsByUserId, createDocument } = require('../db/fileDatabase');
const { calculateAdvancedScore, calculateScoreWithExternalData } = require('../utils/scoringEngine');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all users for banker to assess
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    // Filter out admins and only send necessary data
    const filteredUsers = users.filter(user => user.role !== 'admin').map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      occupation: user.occupation,
      role: user.role,
      creditScore: user.creditScore || null,
      assessed: user.assessed || false
    }));
    res.json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get user details for assessment
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's documents and transactions
    const documents = await getDocumentsByUserId(userId);
    const transactions = await getTransactionsByUserId(userId);
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        occupation: user.occupation,
        role: user.role,
        creditScore: user.creditScore || null
      },
      documents,
      transactions
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Error fetching user details' });
  }
});

// Handle document upload
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, type } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create document record in database
    const document = await createDocument({
      userId,
      name: req.file.originalname,
      type: type || 'unknown',
      path: req.file.path,
      size: req.file.size
    });

    res.json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Error uploading document' });
  }
});

// Perform advanced credit assessment for a specific user
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's documents and transactions for analysis
    const documents = await getDocumentsByUserId(userId);
    const transactions = await getTransactionsByUserId(userId);
    
    // Prepare user data for scoring
    const userData = {
      userProfile: user,
      documents,
      transactions
    };
    
    // Calculate advanced credit score using AI engine
    const assessmentResult = await calculateScoreWithExternalData(userData);
    
    res.json({
      userId: user.id,
      ...assessmentResult
    });
  } catch (error) {
    console.error('Error performing assessment:', error);
    res.status(500).json({ error: 'Error performing assessment' });
  }
});

// Get assessment history for a user
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    // In a real implementation, we would fetch actual assessment history
    // For now, we'll return mock data
    
    res.json({
      assessments: [
        {
          id: 1,
          userId,
          score: 75,
          decision: 'APPROVE_WITH_CAP',
          loanAmount: 10000,
          date: new Date().toISOString(),
          details: 'Initial assessment'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({ error: 'Error fetching assessment history' });
  }
});

// Get demo users
router.get('/demo-users', (req, res) => {
  const demoUsers = [
    {
      id: 'demo1',
      name: 'Rajesh Kumar',
      riskLevel: 'Low Risk'
    },
    {
      id: 'demo2',
      name: 'Priya Sharma',
      riskLevel: 'Medium Risk'
    },
    {
      id: 'demo3',
      name: 'Amit Patel',
      riskLevel: 'High Risk'
    }
  ];
  
  res.json(demoUsers);
});

module.exports = router;