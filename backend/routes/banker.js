const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getAllUsers, getUserById, getUserDocuments } = require('../db/fileDatabase');

const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Get all users (for banker dashboard)
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
    
    // Filter out bankers and admins, only show regular users
    const regularUsers = users.filter(user => user.role === 'user');
    
    // Add credit scores to users (mock data for now)
    const usersWithScores = regularUsers.map(user => {
      // Assign specific scores for default users
      let scoreData;
      
      if (user.id === 1) {
        // Alice Johnson - Score: 60
        scoreData = {
          score: 60,
          decision: 'APPROVE_WITH_CAP',
          loanAmount: 5000,
          message: 'Approved with a capped amount based on your financial history.'
        };
      } else if (user.id === 2) {
        // Bob Smith - Score: 20
        scoreData = {
          score: 20,
          decision: 'REJECT',  // Changed from REVIEW to REJECT
          loanAmount: 0,
          message: 'Your application has been rejected based on your financial history.'
        };
      } else {
        // For other users, assign default scores
        scoreData = {
          score: 50,
          decision: 'REVIEW',
          loanAmount: 2500,
          message: 'Your application requires further review.'
        };
      }
      
      return {
        ...user,
        creditScore: scoreData.score,
        creditDecision: scoreData.decision
      };
    });
    
    res.json({
      users: usersWithScores
    });
  });
});

// Get user details with credit score
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
    
    // Check if user is a banker or admin
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    const { userId } = req.params;
    
    // Get user info
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get credit score (mock data for now)
    let scoreData;
    
    if (userId === '1') {
      // Alice Johnson - Score: 60
      scoreData = {
        score: 60,
        decision: 'APPROVE_WITH_CAP',
        loanAmount: 5000,
        message: 'Approved with a capped amount based on your financial history.',
        reasons: [
          '+25 points for steady income pattern',
          '+10 points for moderate transaction volume (5-9 receipts)',
          '-5 points for low refund percentage (<15%)',
          '+20 points for consistent spending pattern'
        ]
      };
    } else if (userId === '2') {
      // Bob Smith - Score: 20
      scoreData = {
        score: 20,
        decision: 'REJECT',  // Changed from REVIEW to REJECT
        loanAmount: 0,
        message: 'Your application has been rejected based on your financial history.',
        reasons: [
          '+0 points for irregular income pattern',
          '+0 points for low transaction volume (<5 receipts)',
          '-20 points for high refund percentage (>30%)',
          '+0 points for inconsistent spending pattern'
        ]
      };
    } else {
      // For other users, use default data
      scoreData = {
        score: 50,
        decision: 'REVIEW',
        loanAmount: 2500,
        message: 'Your application requires further review.',
        reasons: [
          '+10 points for basic profile completion',
          '+5 points for account age',
          '+15 points for transaction history',
          '-10 points for limited credit history'
        ]
      };
    }
    
    res.json({
      user: {
        ...user,
        creditScore: scoreData.score,
        creditDecision: scoreData.decision,
        loanAmount: scoreData.loanAmount,
        message: scoreData.message,
        reasons: scoreData.reasons
      }
    });
  });
});

// Get user documents
router.get('/documents/:userId', (req, res) => {
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
    
    const { userId } = req.params;
    
    // Get user info
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get actual documents from database
    const documents = getUserDocuments(userId);
    
    // Format documents for frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.original_name,
      type: doc.mime_type.split('/')[1] || doc.mime_type,
      size: formatFileSize(doc.file_size),
      uploadDate: new Date(doc.upload_date).toLocaleDateString()
    }));
    
    res.json({
      documents: formattedDocuments
    });
  });
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download document
router.get('/documents/download/:docId', (req, res) => {
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
    
    const { docId } = req.params;
    
    // In a real implementation, we would fetch the document from storage
    // For this demo, we'll send a mock response
    
    // Create a mock PDF file in memory
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Document Content Placeholder) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000115 00000 n 
0000000285 00000 n 
0000000371 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
478
%%EOF`;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="document-${docId}.pdf"`);
    
    // Send mock PDF content
    res.send(mockPdfContent);
  });
});

module.exports = router;