/**
 * Calculate credit score based on receipt data
 * @param {Array} receipts - Array of receipt objects
 * @returns {Object} Assessment result with score, decision, and reasons
 */
function calculateScore(receipts) {
  let score = 0;
  let reasons = [];
  
  // Validate input
  if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
    return {
      score: 0,
      decision: 'REVIEW',
      reasons: ['No receipt data provided'],
      loanAmount: 0,
      message: 'Your application requires manual review. We will contact you shortly.'
    };
  }
  
  // Validate individual receipts
  const validReceipts = receipts.filter(receipt => 
    receipt && 
    receipt.date && 
    typeof receipt.amount === 'number' && 
    receipt.merchant
  );
  
  if (validReceipts.length === 0) {
    return {
      score: 0,
      decision: 'REVIEW',
      reasons: ['No valid receipt data provided'],
      loanAmount: 0,
      message: 'Your application requires manual review. We will contact you shortly.'
    };
  }
  
  // Rule 1: Steady income (+25 points for consistent pattern)
  const hasSteadyIncome = checkSteadyIncome(validReceipts);
  if (hasSteadyIncome) {
    score += 25;
    reasons.push('+25 points for steady income pattern');
  } else {
    reasons.push('+0 points for irregular income pattern');
  }
  
  // Rule 2: Transaction volume (+20 to +35 points based on volume)
  const transactionVolume = validReceipts.length;
  if (transactionVolume >= 20) {
    score += 35;
    reasons.push('+35 points for very high transaction volume (20+ receipts)');
  } else if (transactionVolume >= 15) {
    score += 30;
    reasons.push('+30 points for high transaction volume (15-19 receipts)');
  } else if (transactionVolume >= 10) {
    score += 20;
    reasons.push('+20 points for good transaction volume (10-14 receipts)');
  } else if (transactionVolume >= 5) {
    score += 10;
    reasons.push('+10 points for moderate transaction volume (5-9 receipts)');
  } else {
    reasons.push('+0 points for low transaction volume (<5 receipts)');
  }
  
  // Rule 3: Refunds penalty (-5 to -20 points based on refund amount)
  const refunds = validReceipts.filter(r => r.amount < 0);
  const refundAmount = Math.abs(refunds.reduce((sum, r) => sum + r.amount, 0));
  const totalSpending = validReceipts.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0);
  
  if (refunds.length > 0 && totalSpending > 0) {
    const refundPercentage = (refundAmount / totalSpending) * 100;
    if (refundPercentage > 30) {
      score -= 20;
      reasons.push('-20 points for high refund percentage (>30%)');
    } else if (refundPercentage > 15) {
      score -= 10;
      reasons.push('-10 points for moderate refund percentage (15-30%)');
    } else {
      score -= 5;
      reasons.push('-5 points for low refund percentage (<15%)');
    }
  } else {
    reasons.push('+0 points for no refunds');
  }
  
  // Rule 4: Consistent spending pattern (+20 points)
  const hasConsistentSpending = checkConsistentSpending(validReceipts);
  if (hasConsistentSpending) {
    score += 20;
    reasons.push('+20 points for consistent spending pattern');
  } else {
    reasons.push('+0 points for inconsistent spending pattern');
  }
  
  // Rule 5: Regular essential spending (+20 points)
  const essentialMerchants = ['Grocery Store', 'Vegetable Market', 'Salary Credit', 'Rent Payment', 'Mobile Recharge'];
  const essentialTransactions = validReceipts.filter(r => 
    essentialMerchants.some(merchant => r.merchant.includes(merchant))
  );
  
  if (essentialTransactions.length >= validReceipts.length * 0.5) {
    score += 20;
    reasons.push('+20 points for regular essential spending');
  } else {
    reasons.push('+0 points for low essential spending');
  }
  
  // Rule 6: High transaction frequency bonus (+15 points)
  const transactionDays = [...new Set(validReceipts.map(r => new Date(r.date).toDateString()))];
  if (transactionDays.length >= 15) {
    score += 15;
    reasons.push('+15 points for high transaction frequency');
  } else if (transactionDays.length >= 10) {
    score += 10;
    reasons.push('+10 points for moderate transaction frequency');
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Determine decision based on score - Updated to match new risk categories
  let decision, loanAmount, message;
  
  if (score >= 75) {
    // Low risk - 75 and above
    decision = 'APPROVE';
    loanAmount = 10000;
    message = 'Congratulations! You are eligible for an instant loan.';
  } else if (score >= 50) {
    // Medium risk - 50 to 74
    decision = 'APPROVE_WITH_CAP';
    loanAmount = 5000;
    message = 'Approved with a capped amount based on your financial history.';
  } else {
    // High risk - below 50
    decision = 'REVIEW';
    loanAmount = 0;
    message = 'Your application requires manual review. We will contact you shortly.';
  }
  
  return {
    score,
    decision,
    reasons,
    loanAmount,
    message
  };
}

/**
 * Check if user has steady income based on receipt patterns
 * @param {Array} receipts - Array of receipt objects
 * @returns {boolean} True if steady income pattern detected
 */
function checkSteadyIncome(receipts) {
  if (receipts.length < 4) return false;
  
  // Group receipts by week
  const weeklyReceipts = groupReceiptsByWeek(receipts);
  
  // Check if there's at least one receipt per week for 4+ weeks
  const weeksWithReceipts = Object.values(weeklyReceipts).filter(week => week.length > 0);
  
  return weeksWithReceipts.length >= 4;
}

/**
 * Get number of receipts in the last N weeks
 * @param {Array} receipts - Array of receipt objects
 * @param {number} weeks - Number of weeks to look back
 * @returns {number} Count of receipts in the specified period
 */
function getReceiptsInLastWeeks(receipts, weeks) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));
  
  return receipts.filter(receipt => {
    const receiptDate = new Date(receipt.date);
    return receiptDate >= cutoffDate;
  }).length;
}

/**
 * Check if user has recent refunds
 * @param {Array} receipts - Array of receipt objects
 * @returns {boolean} True if recent refunds detected
 */
function checkRecentRefunds(receipts) {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  return receipts.some(receipt => {
    const receiptDate = new Date(receipt.date);
    return receiptDate >= twoWeeksAgo && receipt.amount < 0;
  });
}

/**
 * Check if user has consistent spending pattern
 * @param {Array} receipts - Array of receipt objects
 * @returns {boolean} True if consistent spending pattern detected
 */
function checkConsistentSpending(receipts) {
  if (receipts.length < 5) return false;
  
  // Calculate average and standard deviation of receipt amounts
  const amounts = receipts.map(r => Math.abs(r.amount));
  const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  
  const squaredDiffs = amounts.map(amount => Math.pow(amount - average, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(avgSquaredDiff);
  
  // If standard deviation is less than 50% of average, consider it consistent
  return stdDev < (average * 0.5);
}

/**
 * Group receipts by week
 * @param {Array} receipts - Array of receipt objects
 * @returns {Object} Object with weeks as keys and receipt arrays as values
 */
function groupReceiptsByWeek(receipts) {
  const weeks = {};
  
  receipts.forEach(receipt => {
    const date = new Date(receipt.date);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const weekKey = `${year}-W${week}`;
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    
    weeks[weekKey].push(receipt);
  });
  
  return weeks;
}

/**
 * Get week number for a date
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

module.exports = { calculateScore };
