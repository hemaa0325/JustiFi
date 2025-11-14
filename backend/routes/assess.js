const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { 
  createDocument, 
  getDocumentsByUserId, 
  createAssessment,
  logActivity,
  getUserById,
  createLoanRequest,
  getLoanRequestsByUserId
} = require('../db/fileDatabase');

const router = express.Router();

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

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow pdf, jpg, jpeg, png files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

// Get demo users - in a real app, this would come from the database
router.get('/demo-users', (req, res) => {
  const demoUsers = [
    { id: '1', name: 'Rajesh Kumar', occupation: 'Software Engineer' },
    { id: '2', name: 'Priya Sharma', occupation: 'Teacher' },
    { id: '3', name: 'Amit Patel', occupation: 'Business Owner' }
  ];
  res.json(demoUsers);
});

// Document upload endpoint
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Extract other fields from the request body
    const { type, userId } = req.body;
    
    // Create document record
    const documentRecord = await createDocument({
      userId,
      name: req.file.originalname,
      type,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size
    });
    
    // Log the document upload
    await logActivity(userId, 'user', 'UPLOAD_DOCUMENT', null, { 
      documentId: documentRecord.id, 
      documentType: type 
    });
    
    res.json({
      message: 'Document uploaded successfully',
      document: documentRecord
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: error.message || 'Error uploading document' });
  }
});

// User assessment endpoint
router.post('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user documents
    const documents = await getDocumentsByUserId(userId);
    
    // In a real implementation, we would analyze the documents
    // For this demo, we'll generate a mock assessment
    
    // Mock assessment logic
    const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-99
    const safetyLevel = score >= 80 ? 'very safe' : score >= 60 ? 'okay' : 'unsafe';
    const decision = score >= 70 ? 'APPROVE' : score >= 50 ? 'APPROVE_WITH_CAP' : 'REJECT';
    const loanAmount = score >= 80 ? 10000 : score >= 70 ? 7500 : score >= 60 ? 5000 : 2500;
    
    // Mock explanations
    const explanations = [
      { factor: 'income_stability', points: score >= 80 ? 20 : score >= 60 ? 10 : 5, explanation: 'Steady income indicates financial stability' },
      { factor: 'spending_patterns', points: score >= 80 ? 15 : score >= 60 ? 5 : -5, explanation: 'Responsible spending habits observed' },
      { factor: 'repayment_history', points: score >= 80 ? 25 : score >= 60 ? 15 : 0, explanation: 'No late payments or defaults found' },
      { factor: 'account_activity', points: score >= 80 ? 10 : score >= 60 ? 5 : 0, explanation: 'Regular banking activity shows engagement' },
      { factor: 'document_authenticity', points: score >= 80 ? 20 : score >= 60 ? 10 : -10, explanation: 'Documents verified as authentic' }
    ];
    
    // Create assessment record
    const assessment = await createAssessment({
      userId,
      score,
      safetyLevel,
      decision,
      loanAmount,
      explanation: explanations
    });
    
    // Log the assessment creation
    await logActivity(userId, 'user', 'CREATE_ASSESSMENT', null, { 
      assessmentId: assessment.id, 
      score: score, 
      decision: decision, 
      loanAmount: loanAmount 
    });
    
    res.json({
      score,
      safetyLevel,
      decision,
      loanAmount,
      assessmentId: assessment.id,
      message: `Based on our analysis, your credit score is ${score}/100, which is considered ${safetyLevel}.`,
      explanations
    });
  } catch (error) {
    console.error('Error during assessment:', error);
    res.status(500).json({ error: 'Error during assessment' });
  }
});

// New endpoint for creating loan requests
router.post('/user/:userId/loan-request', async (req, res) => {
  const { userId } = req.params;
  const { loanAmount, assessmentId } = req.body;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create loan request
    const loanRequest = await createLoanRequest({
      userId,
      amount: loanAmount,
      assessmentId
    });
    
    res.json({
      message: 'Loan request submitted successfully. Waiting for banker approval.',
      loanRequest
    });
  } catch (error) {
    console.error('Error creating loan request:', error);
    res.status(500).json({ error: error.message || 'Error creating loan request' });
  }
});

// Get user documents endpoint
router.get('/documents/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const documents = await getDocumentsByUserId(userId);
    
    // Log the document view
    await logActivity(userId, 'user', 'VIEW_DOCUMENTS', null, { documentCount: documents.length });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// New endpoint for getting user loan requests
router.get('/user/:userId/loan-requests', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get loan requests for this user
    const loanRequests = await getLoanRequestsByUserId(userId);
    
    res.json(loanRequests);
  } catch (error) {
    console.error('Error fetching loan requests:', error);
    res.status(500).json({ error: error.message || 'Error fetching loan requests' });
  }
});

module.exports = router;