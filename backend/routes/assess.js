const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { saveDocument, saveAssessment } = require('../db/fileDatabase');

const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Helper function to calculate credit score (simplified version)
const calculateScore = (receipts) => {
  // This is a simplified scoring algorithm for demonstration purposes
  let score = 50; // Base score
  let reasons = [];
  
  if (receipts && receipts.length > 0) {
    // Number of receipts
    if (receipts.length >= 10) {
      score += 20;
      reasons.push('+20 points for high transaction volume (10+ receipts)');
    } else if (receipts.length >= 5) {
      score += 10;
      reasons.push('+10 points for moderate transaction volume (5-9 receipts)');
    } else {
      reasons.push('+0 points for low transaction volume (<5 receipts)');
    }
    
    // Spending consistency
    const spendingPattern = analyzeSpendingPattern(receipts);
    if (spendingPattern === 'consistent') {
      score += 15;
      reasons.push('+15 points for consistent spending pattern');
    } else if (spendingPattern === 'moderate') {
      score += 5;
      reasons.push('+5 points for moderate spending pattern');
    } else {
      reasons.push('+0 points for inconsistent spending pattern');
    }
    
    // Refund percentage
    const refundPercentage = calculateRefundPercentage(receipts);
    if (refundPercentage < 15) {
      score += 10;
      reasons.push('+10 points for low refund percentage (<15%)');
    } else if (refundPercentage < 30) {
      reasons.push('+0 points for moderate refund percentage (15-30%)');
    } else {
      score -= 20;
      reasons.push('-20 points for high refund percentage (>30%)');
    }
  }
  
  // Decision based on score
  let decision, loanAmount, message;
  if (score >= 80) {
    decision = 'APPROVE';
    loanAmount = 15000;
    message = 'Approved for the full loan amount based on your excellent financial history.';
  } else if (score >= 60) {
    decision = 'APPROVE_WITH_CAP';
    loanAmount = 7500;
    message = 'Approved with a capped amount based on your financial history.';
  } else if (score >= 45) {
    decision = 'REVIEW';
    loanAmount = 2500;
    message = 'Your application requires further review.';
  } else {
    decision = 'REJECT';
    loanAmount = 0;
    message = 'Your application has been rejected based on your financial history.';
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    decision,
    loanAmount,
    message,
    reasons
  };
};

// Helper function to analyze spending pattern
const analyzeSpendingPattern = (receipts) => {
  if (!receipts || receipts.length === 0) return 'inconsistent';
  
  // Group receipts by month
  const monthlySpending = {};
  receipts.forEach(receipt => {
    const date = new Date(receipt.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!monthlySpending[monthKey]) {
      monthlySpending[monthKey] = 0;
    }
    monthlySpending[monthKey] += receipt.amount;
  });
  
  // Calculate average and standard deviation
  const monthlyAmounts = Object.values(monthlySpending);
  const average = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;
  const variance = monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / monthlyAmounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Determine consistency based on coefficient of variation
  const cv = (stdDev / average) * 100;
  if (cv < 20) return 'consistent';
  if (cv < 40) return 'moderate';
  return 'inconsistent';
};

// Helper function to calculate refund percentage
const calculateRefundPercentage = (receipts) => {
  if (!receipts || receipts.length === 0) return 0;
  
  const refundReceipts = receipts.filter(receipt => receipt.type === 'refund');
  return (refundReceipts.length / receipts.length) * 100;
};

// Mock receipts data
const mockReceipts = [
  { id: 1, userId: 1, date: '2023-01-15', amount: 85.50, merchant: 'Grocery Store', type: 'purchase' },
  { id: 2, userId: 1, date: '2023-01-16', amount: 45.00, merchant: 'Gas Station', type: 'purchase' },
  { id: 3, userId: 1, date: '2023-01-18', amount: 120.75, merchant: 'Restaurant', type: 'purchase' },
  { id: 4, userId: 1, date: '2023-01-20', amount: 65.25, merchant: 'Pharmacy', type: 'purchase' },
  { id: 5, userId: 1, date: '2023-01-22', amount: 30.00, merchant: 'Coffee Shop', type: 'purchase' }
];

// Assess endpoint
router.post('/assess', (req, res) => {
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
    const { receipts } = req.body;
    
    // Use mock receipts if none provided
    const userReceipts = receipts && receipts.length > 0 ? receipts : mockReceipts.filter(r => r.userId == userId);
    
    // Calculate score
    const scoreData = calculateScore(userReceipts);
    
    // Save assessment to database
    try {
      const assessment = saveAssessment({
        userId,
        creditScore: scoreData.score,
        creditDecision: scoreData.decision,
        loanAmount: scoreData.loanAmount,
        message: scoreData.message,
        reasons: scoreData.reasons
      });
      
      res.json({
        assessment: {
          id: assessment.id,
          creditScore: assessment.credit_score,
          creditDecision: assessment.credit_decision,
          loanAmount: assessment.loan_amount,
          message: assessment.message,
          reasons: assessment.reasons,
          createdAt: assessment.created_at
        }
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      res.status(500).json({ error: 'Error saving assessment' });
    }
  });
});

// Upload document endpoint
router.post('/upload', (req, res) => {
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
    const { filename, originalName, fileSize, mimeType } = req.body;
    
    // Save document info to database
    try {
      const document = saveDocument({
        userId,
        filename: filename || `doc-${uuidv4()}`,
        originalName: originalName || 'document.pdf',
        filePath: `/uploads/${filename || `doc-${uuidv4()}`}`,
        fileSize: fileSize || Math.floor(Math.random() * 1000000),
        mimeType: mimeType || 'application/pdf'
      });
      
      res.json({
        document: {
          id: document.id,
          filename: document.filename,
          originalName: document.original_name,
          filePath: document.file_path,
          fileSize: document.file_size,
          mimeType: document.mime_type,
          uploadDate: document.upload_date
        }
      });
    } catch (error) {
      console.error('Error saving document:', error);
      res.status(500).json({ error: 'Error saving document' });
    }
  });
});

module.exports = router;