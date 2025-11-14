const express = require('express');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../db/fileDatabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Mock data for disbursements
let disbursements = [
  { id: '1', userId: '1', amount: 5000, status: 'pending', createdAt: new Date('2023-05-15') },
  { id: '2', userId: '2', amount: 7500, status: 'approved', createdAt: new Date('2023-05-10') },
  { id: '3', userId: '3', amount: 10000, status: 'disbursed', createdAt: new Date('2023-05-05') }
];

// Get disbursements for a user
router.get('/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { userId } = req.params;
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is authorized to view these disbursements
    if (decoded.userId !== userId && decoded.role !== 'banker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    try {
      // Filter disbursements for the user
      const userDisbursements = disbursements.filter(d => d.userId === userId);
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'VIEW_DISBURSEMENTS', null, { 
        targetUserId: userId, 
        disbursementCount: userDisbursements.length 
      });
      
      res.json(userDisbursements);
    } catch (error) {
      console.error('Error fetching disbursements:', error);
      res.status(500).json({ error: 'Error fetching disbursements' });
    }
  });
});

// Approve a disbursement (banker/admin only)
router.put('/:disbursementId/approve', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { disbursementId } = req.params;
  
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
      // Find the disbursement
      const disbursement = disbursements.find(d => d.id === disbursementId);
      if (!disbursement) {
        return res.status(404).json({ error: 'Disbursement not found' });
      }
      
      // Update status to approved
      disbursement.status = 'approved';
      disbursement.approvedAt = new Date();
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'APPROVE_DISBURSEMENT', null, { 
        disbursementId: disbursementId, 
        amount: disbursement.amount 
      });
      
      res.json({
        message: 'Disbursement approved successfully',
        disbursement
      });
    } catch (error) {
      console.error('Error approving disbursement:', error);
      res.status(500).json({ error: 'Error approving disbursement' });
    }
  });
});

// Disburse funds (banker/admin only)
router.put('/:disbursementId/disburse', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { disbursementId } = req.params;
  
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
      // Find the disbursement
      const disbursement = disbursements.find(d => d.id === disbursementId);
      if (!disbursement) {
        return res.status(404).json({ error: 'Disbursement not found' });
      }
      
      // Update status to disbursed
      disbursement.status = 'disbursed';
      disbursement.disbursedAt = new Date();
      
      // Log the action
      await logActivity(decoded.userId, decoded.role, 'DISBURSE_FUNDS', null, { 
        disbursementId: disbursementId, 
        amount: disbursement.amount 
      });
      
      res.json({
        message: 'Funds disbursed successfully',
        disbursement
      });
    } catch (error) {
      console.error('Error disbursing funds:', error);
      res.status(500).json({ error: 'Error disbursing funds' });
    }
  });
});

module.exports = router;