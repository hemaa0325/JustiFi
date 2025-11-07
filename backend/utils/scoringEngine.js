// Advanced Credit Scoring Engine with AI Capabilities
const fs = require('fs');
const path = require('path');

// Enhanced scoring factors with weights
const SCORING_FACTORS = {
  incomeStability: 0.25,
  spendingPattern: 0.20,
  debtToIncome: 0.15,
  creditHistory: 0.15,
  employment: 0.10,
  savingsPattern: 0.10,
  transactionVolume: 0.05
};

// Risk thresholds
const RISK_THRESHOLDS = {
  excellent: 80,
  good: 65,
  fair: 50,
  poor: 30
};

// Enhanced document analysis function
const analyzeDocument = (document) => {
  // This would be replaced with actual OCR and NLP processing in a real implementation
  // For now, we'll simulate document analysis based on document type
  const docType = document.type || 'unknown';
  let scoreImpact = 0;
  let reasons = [];
  
  switch(docType.toLowerCase()) {
    case 'paystub':
      scoreImpact = 15;
      reasons.push('+15 points for verified income documentation');
      break;
    case 'bank_statement':
      scoreImpact = 10;
      reasons.push('+10 points for verified banking history');
      break;
    case 'tax_return':
      scoreImpact = 20;
      reasons.push('+20 points for verified tax documentation');
      break;
    case 'utility_bill':
      scoreImpact = 5;
      reasons.push('+5 points for verified address');
      break;
    default:
      scoreImpact = 2;
      reasons.push('+2 points for document submission');
  }
  
  return { scoreImpact, reasons };
};

// Enhanced spending pattern analysis
const analyzeSpendingPattern = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { score: 0, reasons: ['+0 points for no transaction history'] };
  }
  
  let score = 0;
  let reasons = [];
  
  // Calculate transaction frequency
  const transactionCount = transactions.length;
  if (transactionCount >= 50) {
    score += 15;
    reasons.push('+15 points for high transaction volume (50+ transactions)');
  } else if (transactionCount >= 20) {
    score += 10;
    reasons.push('+10 points for moderate transaction volume (20-49 transactions)');
  } else if (transactionCount >= 5) {
    score += 5;
    reasons.push('+5 points for basic transaction history (5-19 transactions)');
  } else {
    reasons.push('+0 points for limited transaction history (<5 transactions)');
  }
  
  // Analyze spending categories
  const categories = {};
  transactions.forEach(transaction => {
    const category = transaction.category || 'other';
    categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
  });
  
  // Check for essential spending (positive indicator)
  const essentialCategories = ['groceries', 'utilities', 'housing', 'insurance'];
  const essentialSpending = Object.keys(categories)
    .filter(cat => essentialCategories.includes(cat))
    .reduce((sum, cat) => sum + categories[cat], 0);
  
  if (essentialSpending > 0) {
    score += 10;
    reasons.push('+10 points for consistent essential spending');
  }
  
  // Check for risky spending (negative indicator)
  const riskyCategories = ['gambling', 'casino', 'adult'];
  const riskySpending = Object.keys(categories)
    .filter(cat => riskyCategories.includes(cat))
    .reduce((sum, cat) => sum + categories[cat], 0);
  
  if (riskySpending > 0) {
    score -= 15;
    reasons.push('-15 points for high-risk spending categories');
  }
  
  // Analyze spending consistency
  const monthlySpending = {};
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!monthlySpending[monthKey]) {
      monthlySpending[monthKey] = 0;
    }
    monthlySpending[monthKey] += Math.abs(transaction.amount);
  });
  
  const monthlyAmounts = Object.values(monthlySpending);
  if (monthlyAmounts.length > 1) {
    const average = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;
    const variance = monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / monthlyAmounts.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / average) * 100;
    
    if (cv < 20) {
      score += 15;
      reasons.push('+15 points for consistent monthly spending pattern');
    } else if (cv < 40) {
      score += 5;
      reasons.push('+5 points for moderately consistent spending pattern');
    } else {
      score -= 10;
      reasons.push('-10 points for inconsistent spending pattern');
    }
  }
  
  return { score: Math.max(0, Math.min(50, score)), reasons };
};

// Enhanced income stability analysis
const analyzeIncomeStability = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { score: 0, reasons: ['+0 points for no income data'] };
  }
  
  // Filter for income transactions (positive amounts)
  const incomeTransactions = transactions.filter(t => t.amount > 0 && 
    (t.description.toLowerCase().includes('payroll') || 
     t.description.toLowerCase().includes('salary') || 
     t.description.toLowerCase().includes('wage') ||
     t.category === 'income'));
  
  if (incomeTransactions.length === 0) {
    return { score: 5, reasons: ['+5 points for any positive cash flow'] };
  }
  
  let score = 0;
  let reasons = [];
  
  // Frequency of income
  const incomeDates = [...new Set(incomeTransactions.map(t => {
    const date = new Date(t.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  }))].sort();
  
  if (incomeDates.length >= 6) {
    score += 20;
    reasons.push('+20 points for stable income over 6+ months');
  } else if (incomeDates.length >= 3) {
    score += 15;
    reasons.push('+15 points for stable income over 3+ months');
  } else {
    score += 10;
    reasons.push('+10 points for some income history');
  }
  
  // Consistency of income amounts
  if (incomeTransactions.length > 1) {
    const amounts = incomeTransactions.map(t => t.amount);
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / average) * 100;
    
    if (cv < 15) {
      score += 15;
      reasons.push('+15 points for consistent income amounts');
    } else if (cv < 30) {
      score += 10;
      reasons.push('+10 points for moderately consistent income');
    } else {
      score += 5;
      reasons.push('+5 points for variable income');
    }
  }
  
  return { score: Math.max(0, Math.min(50, score)), reasons };
};

// Enhanced debt analysis
const analyzeDebt = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { score: 20, reasons: ['+20 points for no apparent debt'] };
  }
  
  // Filter for debt-related transactions
  const debtTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes('credit') ||
    t.description.toLowerCase().includes('loan') ||
    t.description.toLowerCase().includes('mortgage') ||
    t.category === 'debt_payment' ||
    t.category === 'loan_payment'
  );
  
  if (debtTransactions.length === 0) {
    return { score: 25, reasons: ['+25 points for no apparent debt obligations'] };
  }
  
  let score = 20;
  let reasons = ['+20 base points for debt analysis'];
  
  // Calculate total debt payments
  const totalDebtPayments = debtTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  
  if (totalIncome > 0) {
    const debtToIncomeRatio = totalDebtPayments / totalIncome;
    
    if (debtToIncomeRatio < 0.2) {
      score += 15;
      reasons.push('+15 points for healthy debt-to-income ratio (<20%)');
    } else if (debtToIncomeRatio < 0.4) {
      score += 5;
      reasons.push('+5 points for moderate debt-to-income ratio (20-40%)');
    } else {
      score -= 20;
      reasons.push('-20 points for high debt-to-income ratio (>40%)');
    }
  }
  
  return { score: Math.max(0, Math.min(50, score)), reasons };
};

// Enhanced employment verification
const analyzeEmployment = (documents) => {
  if (!documents || documents.length === 0) {
    return { score: 0, reasons: ['+0 points for no employment verification'] };
  }
  
  // Look for employment-related documents
  const employmentDocs = documents.filter(doc => 
    doc.type === 'paystub' || 
    doc.type === 'employment_letter' ||
    doc.type === 'tax_return' ||
    (doc.name && (doc.name.toLowerCase().includes('paystub') || 
                  doc.name.toLowerCase().includes('employment') ||
                  doc.name.toLowerCase().includes('w2') ||
                  doc.name.toLowerCase().includes('1099')))
  );
  
  if (employmentDocs.length > 0) {
    return { 
      score: 20, 
      reasons: ['+20 points for employment verification documents'] 
    };
  }
  
  return { score: 5, reasons: ['+5 points for document submission'] };
};

// Enhanced savings pattern analysis
const analyzeSavings = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { score: 0, reasons: ['+0 points for no savings data'] };
  }
  
  // Look for transfers to savings accounts
  const savingsTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes('saving') ||
    t.description.toLowerCase().includes('transfer') ||
    t.category === 'savings' ||
    (t.account && t.account.toLowerCase().includes('saving'))
  );
  
  if (savingsTransactions.length === 0) {
    return { score: 0, reasons: ['+0 points for no apparent savings activity'] };
  }
  
  // Calculate total savings
  const totalSavings = savingsTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  if (totalSavings > 10000) {
    return { 
      score: 20, 
      reasons: ['+20 points for substantial savings (> $10,000)'] 
    };
  } else if (totalSavings > 5000) {
    return { 
      score: 15, 
      reasons: ['+15 points for good savings (> $5,000)'] 
    };
  } else if (totalSavings > 1000) {
    return { 
      score: 10, 
      reasons: ['+10 points for moderate savings (> $1,000)'] 
    };
  } else {
    return { 
      score: 5, 
      reasons: ['+5 points for some savings activity'] 
    };
  }
};

// Main credit scoring function
const calculateAdvancedScore = (userData) => {
  const { transactions = [], documents = [], userProfile = {} } = userData;
  
  // Initialize scoring components
  let componentScores = {
    incomeStability: { score: 0, reasons: [] },
    spendingPattern: { score: 0, reasons: [] },
    debtToIncome: { score: 0, reasons: [] },
    creditHistory: { score: 0, reasons: [] },
    employment: { score: 0, reasons: [] },
    savingsPattern: { score: 0, reasons: [] },
    transactionVolume: { score: 0, reasons: [] }
  };
  
  // Analyze each component
  componentScores.incomeStability = analyzeIncomeStability(transactions);
  componentScores.spendingPattern = analyzeSpendingPattern(transactions);
  componentScores.debtToIncome = analyzeDebt(transactions);
  componentScores.employment = analyzeEmployment(documents);
  componentScores.savingsPattern = analyzeSavings(transactions);
  
  // Credit history (mock - would be real in production)
  componentScores.creditHistory = {
    score: userProfile.creditHistoryScore || 50,
    reasons: userProfile.creditHistoryScore 
      ? ['+0 points for existing credit history score'] 
      : ['+50 base points for credit history (mock)']
  };
  
  // Transaction volume scoring
  if (transactions.length >= 100) {
    componentScores.transactionVolume = {
      score: 10,
      reasons: ['+10 points for high transaction volume (100+ transactions)']
    };
  } else if (transactions.length >= 50) {
    componentScores.transactionVolume = {
      score: 7,
      reasons: ['+7 points for good transaction volume (50-99 transactions)']
    };
  } else if (transactions.length >= 20) {
    componentScores.transactionVolume = {
      score: 5,
      reasons: ['+5 points for moderate transaction volume (20-49 transactions)']
    };
  } else {
    componentScores.transactionVolume = {
      score: 2,
      reasons: ['+2 points for basic transaction volume (<20 transactions)']
    };
  }
  
  // Calculate weighted total score
  let totalScore = 0;
  let allReasons = [];
  
  Object.keys(componentScores).forEach(component => {
    const weight = SCORING_FACTORS[component] || 0;
    const componentScore = componentScores[component].score || 0;
    totalScore += componentScore * weight;
    allReasons = [...allReasons, ...componentScores[component].reasons];
  });
  
  // Ensure score is within bounds
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));
  
  // Determine credit decision
  let decision, loanAmount, message;
  
  if (totalScore >= RISK_THRESHOLDS.excellent) {
    decision = 'APPROVE';
    loanAmount = 15000;
    message = 'Approved for the full loan amount based on excellent financial history.';
  } else if (totalScore >= RISK_THRESHOLDS.good) {
    decision = 'APPROVE_WITH_CAP';
    loanAmount = 10000;
    message = 'Approved with a capped amount based on good financial history.';
  } else if (totalScore >= RISK_THRESHOLDS.fair) {
    decision = 'APPROVE_WITH_CAP';
    loanAmount = 5000;
    message = 'Approved with a capped amount based on fair financial history.';
  } else if (totalScore >= RISK_THRESHOLDS.poor) {
    decision = 'REVIEW';
    loanAmount = 2500;
    message = 'Application requires further review due to limited financial history.';
  } else {
    decision = 'REJECT';
    loanAmount = 0;
    message = 'Application rejected due to high risk factors in financial history.';
  }
  
  return {
    score: totalScore,
    decision,
    loanAmount,
    message,
    reasons: allReasons,
    componentScores
  };
};

// Function to integrate with external credit bureaus (mock implementation)
const integrateExternalCreditBureaus = async (userData) => {
  // In a real implementation, this would call external APIs
  // For now, we'll simulate external data
  
  // Simulate external credit score
  const externalScore = Math.floor(Math.random() * 300) + 550; // Range 550-850
  
  // Simulate credit report data
  const creditReport = {
    score: externalScore,
    inquiries: Math.floor(Math.random() * 5),
    derogatoryMarks: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
    creditAgeMonths: Math.floor(Math.random() * 120) + 12, // 1-10 years
    utilizationRate: Math.random() * 100,
    accounts: [
      { type: 'credit_card', status: 'open', balance: Math.floor(Math.random() * 5000) },
      { type: 'auto_loan', status: 'open', balance: Math.floor(Math.random() * 20000) + 5000 }
    ]
  };
  
  return creditReport;
};

// Enhanced scoring function that includes external data
const calculateScoreWithExternalData = async (userData) => {
  // Get base score
  const baseScore = calculateAdvancedScore(userData);
  
  // Get external credit data
  const externalData = await integrateExternalCreditBureaus(userData);
  
  // Adjust score based on external data
  let adjustedScore = baseScore.score;
  let externalReasons = [];
  
  // Adjust based on external credit score
  if (externalData.score >= 750) {
    adjustedScore = Math.min(100, adjustedScore + 10);
    externalReasons.push('+10 points for excellent external credit score');
  } else if (externalData.score >= 700) {
    adjustedScore = Math.min(100, adjustedScore + 5);
    externalReasons.push('+5 points for good external credit score');
  } else if (externalData.score >= 650) {
    // No adjustment
    externalReasons.push('+0 points for fair external credit score');
  } else if (externalData.score >= 600) {
    adjustedScore = Math.max(0, adjustedScore - 5);
    externalReasons.push('-5 points for below average external credit score');
  } else {
    adjustedScore = Math.max(0, adjustedScore - 15);
    externalReasons.push('-15 points for poor external credit score');
  }
  
  // Adjust based on credit inquiries
  if (externalData.inquiries <= 2) {
    adjustedScore = Math.min(100, adjustedScore + 3);
    externalReasons.push('+3 points for minimal credit inquiries');
  } else if (externalData.inquiries <= 5) {
    // No adjustment
    externalReasons.push('+0 points for moderate credit inquiries');
  } else {
    adjustedScore = Math.max(0, adjustedScore - 5);
    externalReasons.push('-5 points for excessive credit inquiries');
  }
  
  // Adjust based on derogatory marks
  if (externalData.derogatoryMarks === 0) {
    adjustedScore = Math.min(100, adjustedScore + 8);
    externalReasons.push('+8 points for clean credit history');
  } else if (externalData.derogatoryMarks <= 2) {
    adjustedScore = Math.max(0, adjustedScore - 10);
    externalReasons.push('-10 points for minor derogatory marks');
  } else {
    adjustedScore = Math.max(0, adjustedScore - 25);
    externalReasons.push('-25 points for significant derogatory marks');
  }
  
  // Ensure final score is within bounds
  adjustedScore = Math.max(0, Math.min(100, Math.round(adjustedScore)));
  
  // Determine final decision
  let decision, loanAmount, message;
  
  if (adjustedScore >= RISK_THRESHOLDS.excellent) {
    decision = 'APPROVE';
    loanAmount = 20000;
    message = 'Approved for the maximum loan amount based on comprehensive financial analysis.';
  } else if (adjustedScore >= RISK_THRESHOLDS.good) {
    decision = 'APPROVE_WITH_CAP';
    loanAmount = 15000;
    message = 'Approved with a capped amount based on strong financial profile.';
  } else if (adjustedScore >= RISK_THRESHOLDS.fair) {
    decision = 'APPROVE_WITH_CAP';
    loanAmount = 8000;
    message = 'Approved with a capped amount based on acceptable financial history.';
  } else if (adjustedScore >= RISK_THRESHOLDS.poor) {
    decision = 'REVIEW';
    loanAmount = 4000;
    message = 'Application requires further review due to mixed financial indicators.';
  } else {
    decision = 'REJECT';
    loanAmount = 0;
    message = 'Application rejected due to high risk factors in comprehensive analysis.';
  }
  
  return {
    score: adjustedScore,
    decision,
    loanAmount,
    message,
    reasons: [...baseScore.reasons, ...externalReasons],
    componentScores: baseScore.componentScores,
    externalData
  };
};

module.exports = {
  calculateAdvancedScore,
  calculateScoreWithExternalData,
  analyzeDocument,
  analyzeSpendingPattern,
  analyzeIncomeStability,
  analyzeDebt,
  analyzeEmployment,
  analyzeSavings
};