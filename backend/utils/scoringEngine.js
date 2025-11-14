// Advanced Credit Scoring Engine with File-based Database Integration
const { createAssessment, getAssessmentsByUserId } = require('../db/fileDatabase');

// Enhanced scoring factors with weights for proportional scoring
const SCORING_FACTORS = {
  incomeStability: 0.15,
  spendingPattern: 0.15,
  savingsBehavior: 0.15,
  debtToIncome: 0.12,
  repaymentHistory: 0.12,
  externalCredit: 0.10,
  receiptQuality: 0.08,
  transactionVolume: 0.03,
  employmentVerification: 0.05,
  financialStability: 0.05
};

// Safety level thresholds
const SAFETY_LEVELS = {
  unsafe: 60,
  okay: 80,
  verySafe: 100
};

// Enhanced document analysis function
const analyzeDocument = (document) => {
  const docType = document.type || 'unknown';
  let scoreImpact = 0;
  let explanations = [];
  
  switch(docType.toLowerCase()) {
    case 'salary_receipt':
      scoreImpact = 25;
      explanations.push({
        factor: 'receipt_quality',
        points: 25,
        explanation: 'Points added because your salary receipt shows stable employment and verified income.'
      });
      break;
    case 'bank_statement':
      scoreImpact = 20;
      explanations.push({
        factor: 'receipt_quality',
        points: 20,
        explanation: 'Points added because your bank statement provides comprehensive financial history.'
      });
      break;
    case 'aadhaar':
    case 'aadhar_card':
    case 'id_document':
      // Check if it's an Aadhar card based on type
      if (docType.toLowerCase().includes('aadhar')) {
        scoreImpact = 15;
        explanations.push({
          factor: 'receipt_quality',
          points: 15,
          explanation: 'Points added because your Aadhaar card verifies your identity.'
        });
      } else if (docType.toLowerCase().includes('pan')) {
        scoreImpact = 20;
        explanations.push({
          factor: 'receipt_quality',
          points: 20,
          explanation: 'Points added because your PAN card verifies your tax identity.'
        });
      } else {
        // Generic ID document
        scoreImpact = 15;
        explanations.push({
          factor: 'receipt_quality',
          points: 15,
          explanation: 'Points added because your ID document verifies your identity.'
        });
      }
      break;
    case 'pan':
    case 'pan_card':
      scoreImpact = 20;
      explanations.push({
        factor: 'receipt_quality',
        points: 20,
        explanation: 'Points added because your PAN card verifies your tax identity.'
      });
      break;
    default:
      scoreImpact = 10;
      explanations.push({
        factor: 'receipt_quality',
        points: 10,
        explanation: 'Points added because you submitted documentation, showing financial awareness.'
      });
  }
  
  return { scoreImpact, explanations };
};

// Enhanced spending pattern analysis
const analyzeSpendingPattern = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { 
      score: 0, 
      explanations: [{
        factor: 'spending_pattern',
        points: 0,
        explanation: 'No points added or deducted due to lack of transaction history.'
      }] 
    };
  }
  
  let score = 0;
  let explanations = [];
  
  // Calculate transaction frequency
  const transactionCount = transactions.length;
  if (transactionCount >= 100) {
    score += 25;
    explanations.push({
      factor: 'spending_pattern',
      points: 25,
      explanation: 'Points added because you have a high transaction volume, indicating active financial behavior.'
    });
  } else if (transactionCount >= 50) {
    score += 15;
    explanations.push({
      factor: 'spending_pattern',
      points: 15,
      explanation: 'Points added because you have a good transaction volume, showing consistent financial activity.'
    });
  } else if (transactionCount >= 20) {
    score += 10;
    explanations.push({
      factor: 'spending_pattern',
      points: 10,
      explanation: 'Points added because you have a moderate transaction volume, indicating regular financial engagement.'
    });
  }
  
  return { score: Math.max(-10, Math.min(40, score)), explanations };
};

// Enhanced income stability analysis
const analyzeIncomeStability = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { 
      score: 0, 
      explanations: [{
        factor: 'income_stability',
        points: 0,
        explanation: 'No points added or deducted due to lack of income data.'
      }] 
    };
  }
  
  // Filter for income transactions
  const incomeTransactions = transactions.filter(t => t.amount > 0);
  
  if (incomeTransactions.length === 0) {
    return { 
      score: 5, 
      explanations: [{
        factor: 'income_stability',
        points: 5,
        explanation: 'Points added because you have some positive cash flow, indicating financial activity.'
      }] 
    };
  }
  
  let score = 0;
  let explanations = [];
  
  // Frequency of income
  const incomeDates = [...new Set(incomeTransactions.map(t => {
    const date = new Date(t.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  }))].sort();
  
  if (incomeDates.length >= 12) {
    score += 30;
    explanations.push({
      factor: 'income_stability',
      points: 30,
      explanation: 'Points added because you have stable income over 12+ months, indicating consistent employment.'
    });
  } else if (incomeDates.length >= 6) {
    score += 20;
    explanations.push({
      factor: 'income_stability',
      points: 20,
      explanation: 'Points added because you have stable income over 6+ months, indicating recent employment stability.'
    });
  } else if (incomeDates.length >= 3) {
    score += 10;
    explanations.push({
      factor: 'income_stability',
      points: 10,
      explanation: 'Points added because you have stable income over 3+ months, indicating emerging employment stability.'
    });
  }
  
  return { score: Math.max(0, Math.min(50, score)), explanations };
};

// Enhanced debt analysis
const analyzeDebt = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { 
      score: 25, 
      explanations: [{
        factor: 'debt_ratio',
        points: 25,
        explanation: 'Points added because there is no apparent debt in your transaction history.'
      }] 
    };
  }
  
  // Filter for debt-related transactions
  const debtTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes('credit') ||
    t.description.toLowerCase().includes('loan') ||
    t.description.toLowerCase().includes('emi') ||
    t.category === 'credit_card' ||
    t.category === 'loan_payment'
  );
  
  if (debtTransactions.length === 0) {
    return { 
      score: 35, 
      explanations: [{
        factor: 'debt_ratio',
        points: 35,
        explanation: 'Points added because you have no apparent debt obligations, indicating very low financial risk.'
      }] 
    };
  }
  
  let score = 25;
  let explanations = [{
    factor: 'debt_ratio',
    points: 25,
    explanation: 'Base points for debt analysis based on your debt payment history.'
  }];
  
  // Calculate total debt payments
  const totalDebtPayments = debtTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  
  if (totalIncome > 0) {
    const debtToIncomeRatio = totalDebtPayments / totalIncome;
    
    if (debtToIncomeRatio < 0.1) {
      score += 25;
      explanations.push({
        factor: 'debt_ratio',
        points: 25,
        explanation: 'Points added because your debt-to-income ratio is low, indicating strong financial health.'
      });
    } else if (debtToIncomeRatio < 0.2) {
      score += 15;
      explanations.push({
        factor: 'debt_ratio',
        points: 15,
        explanation: 'Points added because your debt-to-income ratio is moderate, indicating manageable debt levels.'
      });
    } else if (debtToIncomeRatio < 0.3) {
      score += 5;
      explanations.push({
        factor: 'debt_ratio',
        points: 5,
        explanation: 'Points added because your debt-to-income ratio is acceptable, indicating reasonable debt burden.'
      });
    } else {
      score -= 20;
      explanations.push({
        factor: 'debt_ratio',
        points: -20,
        explanation: 'Points deducted because your debt-to-income ratio is high, indicating potential financial strain.'
      });
    }
  }
  
  return { score: Math.max(-10, Math.min(50, score)), explanations };
};

// Enhanced repayment history analysis
const analyzeRepaymentHistory = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { 
      score: 15, 
      explanations: [{
        factor: 'repayment_history',
        points: 15,
        explanation: 'Points added because there is no apparent missed payment history.'
      }] 
    };
  }
  
  // Look for late payment indicators
  const latePayments = transactions.filter(t => 
    t.description.toLowerCase().includes('late payment') ||
    t.description.toLowerCase().includes('overdue') ||
    t.description.toLowerCase().includes('penalty') ||
    t.description.toLowerCase().includes('late fee') ||
    t.category === 'late_fee'
  );
  
  // Look for on-time payment indicators
  const onTimePayments = transactions.filter(t => 
    t.description.toLowerCase().includes('payment') &&
    !t.description.toLowerCase().includes('late') &&
    !t.description.toLowerCase().includes('overdue')
  );
  
  let score = 15;
  let explanations = [{
    factor: 'repayment_history',
    points: 15,
    explanation: 'Base points for repayment history analysis.'
  }];
  
  // Positive scoring for good repayment behavior
  if (onTimePayments.length > 0) {
    const onTimeScore = Math.min(20, Math.floor(onTimePayments.length / 2));
    score += onTimeScore;
    explanations.push({
      factor: 'repayment_history',
      points: onTimeScore,
      explanation: 'Points added because you have a good history of on-time payments.'
    });
  }
  
  if (latePayments.length === 0) {
    score += 30;
    explanations.push({
      factor: 'repayment_history',
      points: 30,
      explanation: 'Points added because you have a perfect repayment history with no late payments.'
    });
    return { score: Math.min(70, score), explanations };
  }
  
  // Calculate penalty from late payments
  const totalLateFees = latePayments.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  if (totalLateFees < 50 && latePayments.length <= 2) {
    score += 10;
    explanations.push({
      factor: 'repayment_history',
      points: 10,
      explanation: 'Points added because you have minimal late payment fees and few recent late payments.'
    });
  } else if (totalLateFees < 150 && latePayments.length <= 4) {
    explanations.push({
      factor: 'repayment_history',
      points: 0,
      explanation: 'No points added or deducted due to moderate late payment history.'
    });
  } else if (totalLateFees < 300 && latePayments.length <= 6) {
    score -= 15;
    explanations.push({
      factor: 'repayment_history',
      points: -15,
      explanation: 'Points deducted because you have significant late payment fees and recent late payments.'
    });
  } else {
    score -= 30;
    explanations.push({
      factor: 'repayment_history',
      points: -30,
      explanation: 'Points deducted because you have severe late payment issues with high fees and frequent recent late payments.'
    });
  }
  
  return { score: Math.max(-10, Math.min(50, score)), explanations };
};

// Enhanced employment verification
const analyzeEmployment = (documents) => {
  if (!documents || documents.length === 0) {
    return { 
      score: 0, 
      explanations: [{
        factor: 'employment_verification',
        points: 0,
        explanation: 'No points added or deducted due to lack of employment verification documents.'
      }] 
    };
  }
  
  // Look for employment-related documents
  const employmentDocs = documents.filter(doc => 
    doc.type === 'salary_receipt' || 
    doc.type === 'employment_letter' ||
    doc.type === 'tax_return' ||
    doc.type === 'paystub' ||
    doc.type === 'w2'
  );
  
  let score = 0;
  let explanations = [];
  
  if (employmentDocs.length > 0) {
    score += 25;
    explanations.push({
      factor: 'employment_verification',
      points: 25,
      explanation: 'Points added because you provided employment-related documents, confirming stable income.'
    });
  }
  
  return { score, explanations };
};

// Main scoring function that stores results in MySQL
const calculateCreditScore = async (userId, documents, transactions) => {
  try {
    // Analyze each factor
    const documentAnalysis = analyzeDocument(documents[0] || {});
    const spendingAnalysis = analyzeSpendingPattern(transactions);
    const incomeAnalysis = analyzeIncomeStability(transactions);
    const debtAnalysis = analyzeDebt(transactions);
    const repaymentAnalysis = analyzeRepaymentHistory(transactions);
    const employmentAnalysis = analyzeEmployment(documents);
    
    // Calculate weighted score
    const weightedScore = Math.round(
      (documentAnalysis.scoreImpact || 0) * SCORING_FACTORS.receiptQuality +
      spendingAnalysis.score * SCORING_FACTORS.spendingPattern +
      incomeAnalysis.score * SCORING_FACTORS.incomeStability +
      debtAnalysis.score * SCORING_FACTORS.debtToIncome +
      repaymentAnalysis.score * SCORING_FACTORS.repaymentHistory +
      employmentAnalysis.score * SCORING_FACTORS.employmentVerification
    );
    
    // Ensure score is within bounds
    const finalScore = Math.max(300, Math.min(850, weightedScore));
    
    // Determine safety level
    let safetyLevel = 'unsafe';
    if (finalScore >= SAFETY_LEVELS.verySafe) {
      safetyLevel = 'very safe';
    } else if (finalScore >= SAFETY_LEVELS.okay) {
      safetyLevel = 'okay';
    }
    
    // Combine all explanations
    const allExplanations = [
      ...documentAnalysis.explanations,
      ...spendingAnalysis.explanations,
      ...incomeAnalysis.explanations,
      ...debtAnalysis.explanations,
      ...repaymentAnalysis.explanations,
      ...employmentAnalysis.explanations
    ];
    
    // Store assessment in MySQL
    const assessment = await createAssessment({
      userId,
      score: finalScore,
      safetyLevel,
      explanation: allExplanations
    });
    
    return {
      score: finalScore,
      safetyLevel,
      explanations: allExplanations,
      assessmentId: assessment.id
    };
  } catch (error) {
    console.error('Error calculating credit score:', error);
    throw error;
  }
};

// Get user assessments from MySQL
const getUserAssessments = async (userId) => {
  try {
    const assessments = await getAssessmentsByUserId(userId);
    return assessments;
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    throw error;
  }
};

module.exports = {
  calculateCreditScore,
  getUserAssessments
};