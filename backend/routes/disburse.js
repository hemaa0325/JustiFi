const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { saveDisbursement, getUserDisbursements } = require('../db/fileDatabase');

const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Disburse loan endpoint
router.post('/loan', (req, res) => {
  // Verify JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { userId } = decoded;
    const { amount, accountNumber, bankName } = req.body;
    
    // Validate required fields
    if (!amount || !accountNumber || !bankName) {
      return res.status(400).json({ error: 'Amount, account number, and bank name are required' });
    }
    
    // Save disbursement to database
    try {
      const disbursement = saveDisbursement({
        userId,
        amount,
        accountNumber,
        bankName
      });
      
      // Simulate processing delay
      setTimeout(() => {
        // In a real app, you would update the status in the database
        console.log(`Disbursement ${disbursement.id} completed`);
      }, 3000);
      
      res.json({
        disbursement: {
          id: disbursement.id,
          amount: disbursement.amount,
          accountNumber: disbursement.account_number.replace(/.(?=.{4})/g, '*'), // Mask account number
          bankName: disbursement.bank_name,
          status: disbursement.status,
          createdAt: disbursement.created_at
        },
        message: 'Loan disbursement initiated successfully. Funds will be transferred within 24 hours.'
      });
    } catch (error) {
      console.error('Error saving disbursement:', error);
      res.status(500).json({ error: 'Error saving disbursement' });
    }
  });
});

module.exports = router;