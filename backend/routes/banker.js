const express = require('express');
const jwt = require('jsonwebtoken');
const { 
  getAllUsers, 
  getDocumentsByUserId, 
  getTransactionsByUserId,
  createAssessment,
  logActivity,
  getAllLoanRequests,
  updateLoanRequestStatus,
  getUserById
} = require('../db/fileDatabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Get all users for banker review
router.get('/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      const users = await getAllUsers();
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'BANKER_VIEW_ALL_USERS', null, { userCount: users.length });
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  });
});

// Get user documents for review
router.get('/documents/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { userId } = req.params;
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      const documents = await getDocumentsByUserId(userId);
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'BANKER_VIEW_USER_DOCUMENTS', null, { 
        targetUserId: userId, 
        documentCount: documents.length 
      });
      
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Error fetching documents' });
    }
  });
});

// Manual assessment by banker
router.post('/assess/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { userId } = req.params;
  const { score, decision, loanAmount, safetyLevel, explanation } = req.body;
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      // Create assessment record
      const assessment = await createAssessment({
        userId,
        score,
        decision,
        loanAmount,
        safetyLevel,
        explanation
      });
      
      // Log the manual assessment
      await logActivity(decoded.userId, decoded.role, 'BANKER_CREATE_ASSESSMENT', null, { 
        targetUserId: userId, 
        assessmentId: assessment.id, 
        score: score, 
        decision: decision,
        loanAmount: loanAmount,
        safetyLevel: safetyLevel 
      });
      
      res.json({
        message: 'Manual assessment completed successfully',
        assessment
      });
    } catch (error) {
      console.error('Error creating assessment:', error);
      res.status(500).json({ error: 'Error creating assessment' });
    }
  });
});

// Update document status
router.put('/documents/:documentId/status', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { documentId } = req.params;
  const { status } = req.body;
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // In a real implementation, we would update the document status in the database
    // For now, we'll just log the action
    
    try {
      // Log the document status update
      await logActivity(decoded.userId, decoded.role, 'BANKER_UPDATE_DOCUMENT_STATUS', null, { 
        documentId: documentId, 
        newStatus: status 
      });
      
      res.json({
        message: `Document status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      res.status(500).json({ error: 'Error updating document status' });
    }
  });
});

// Get user details for assessment (documents and transactions)
router.get('/user/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { userId } = req.params;
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      // Get user profile from auth route
      const userProfileResponse = await fetch(`http://localhost:${process.env.PORT || 52095}/api/auth/profile/${userId}`, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });
      
      if (!userProfileResponse.ok) {
        const errorData = await userProfileResponse.json();
        return res.status(userProfileResponse.status).json({ error: errorData.error || 'Error fetching user profile' });
      }
      
      const userProfile = await userProfileResponse.json();
      
      // Get user documents
      const documents = await getDocumentsByUserId(userId);
      
      // Get user transactions
      const transactions = await getTransactionsByUserId(userId);
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'BANKER_VIEW_USER_DETAILS', null, { 
        targetUserId: userId 
      });
      
      res.json({
        user: userProfile.user,
        documents,
        transactions
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Error fetching user details' });
    }
  });
});

// New endpoint to get all loan requests
router.get('/loan-requests', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      const loanRequests = await getAllLoanRequests();
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'BANKER_VIEW_LOAN_REQUESTS', null, { loanRequestCount: loanRequests.length });
      
      res.json(loanRequests);
    } catch (error) {
      console.error('Error fetching loan requests:', error);
      res.status(500).json({ error: 'Error fetching loan requests' });
    }
  });
});

// New endpoint to approve/reject loan requests
router.put('/loan-requests/:loanId/status', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { loanId } = req.params;
  const { status } = req.body; // pending, approved, rejected, disbursed
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'disbursed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    try {
      const updatedLoanRequest = await updateLoanRequestStatus(loanId, status, decoded.userId, decoded.role);
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, `BANKER_${status.toUpperCase()}_LOAN_REQUEST`, null, { 
        loanId: loanId, 
        newStatus: status 
      });
      
      // Send notification to user when loan is approved
      if (status === 'approved') {
        // Get user details for notification
        const user = await getUserById(updatedLoanRequest.user_id);
        if (user) {
          // In a real implementation, we would send a real notification
          // For now, we'll just log that a notification should be sent
          console.log(`Notification should be sent to user ${user.username} that their loan has been approved`);
        }
      }
      
      res.json({
        message: `Loan request ${status} successfully`,
        loanRequest: updatedLoanRequest
      });
    } catch (error) {
      console.error('Error updating loan request status:', error);
      res.status(500).json({ error: error.message || 'Error updating loan request status' });
    }
  });
});

module.exports = router;