// Test script for the enhanced AI credit scoring system
const { calculateAdvancedScore, calculateScoreWithExternalData } = require('./backend/utils/scoringEngine');

// Sample user data for testing
const sampleUserData = {
  userProfile: {
    id: 'user123',
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    occupation: 'Software Engineer',
    creditHistoryScore: 720
  },
  documents: [
    { id: 'doc1', name: 'Paystub Q1', type: 'paystub' },
    { id: 'doc2', name: 'Bank Statement', type: 'bank_statement' },
    { id: 'doc3', name: 'Tax Return 2023', type: 'tax_return' }
  ],
  transactions: [
    { id: 'tx1', date: '2023-01-15', description: 'Salary Deposit', amount: 5000, category: 'income' },
    { id: 'tx2', date: '2023-01-16', description: 'Grocery Store', amount: -150, category: 'groceries' },
    { id: 'tx3', date: '2023-01-17', description: 'Electric Bill', amount: -85, category: 'utilities' },
    { id: 'tx4', date: '2023-01-20', description: 'Restaurant', amount: -65, category: 'dining' },
    { id: 'tx5', date: '2023-02-15', description: 'Salary Deposit', amount: 5100, category: 'income' },
    { id: 'tx6', date: '2023-02-16', description: 'Grocery Store', amount: -175, category: 'groceries' },
    { id: 'tx7', date: '2023-02-18', description: 'Gas Station', amount: -55, category: 'transportation' },
    { id: 'tx8', date: '2023-02-20', description: 'Electric Bill', amount: -90, category: 'utilities' },
    { id: 'tx9', date: '2023-03-15', description: 'Salary Deposit', amount: 5050, category: 'income' },
    { id: 'tx10', date: '2023-03-16', description: 'Grocery Store', amount: -160, category: 'groceries' },
    { id: 'tx11', date: '2023-03-19', description: 'Mortgage Payment', amount: -1200, category: 'housing' },
    { id: 'tx12', date: '2023-03-22', description: 'Electric Bill', amount: -88, category: 'utilities' },
    { id: 'tx13', date: '2023-03-25', description: 'Savings Transfer', amount: -500, category: 'savings' }
  ]
};

console.log('=== Enhanced AI Credit Scoring System Test ===\n');

// Test the advanced scoring engine
console.log('1. Testing Advanced Credit Scoring Engine...\n');

const advancedScore = calculateAdvancedScore(sampleUserData);
console.log('Advanced Score Result:');
console.log(`Score: ${advancedScore.score}/100`);
console.log(`Decision: ${advancedScore.decision}`);
console.log(`Recommended Loan Amount: $${advancedScore.loanAmount.toLocaleString()}`);
console.log(`Message: ${advancedScore.message}`);
console.log('\nScoring Factors:');
advancedScore.reasons.forEach((reason, index) => {
  console.log(`  ${index + 1}. ${reason}`);
});

console.log('\n' + '='.repeat(50) + '\n');

// Test the scoring engine with external data integration
console.log('2. Testing Credit Scoring with External Data Integration...\n');

calculateScoreWithExternalData(sampleUserData).then(externalScore => {
  console.log('Score with External Data Result:');
  console.log(`Score: ${externalScore.score}/100`);
  console.log(`Decision: ${externalScore.decision}`);
  console.log(`Recommended Loan Amount: $${externalScore.loanAmount.toLocaleString()}`);
  console.log(`Message: ${externalScore.message}`);
  
  console.log('\nExternal Credit Bureau Data:');
  console.log(`  External Score: ${externalScore.externalData.score}`);
  console.log(`  Inquiries: ${externalScore.externalData.inquiries}`);
  console.log(`  Derogatory Marks: ${externalScore.externalData.derogatoryMarks}`);
  console.log(`  Credit Age: ${Math.floor(externalScore.externalData.creditAgeMonths / 12)} years`);
  console.log(`  Utilization Rate: ${externalScore.externalData.utilizationRate.toFixed(2)}%`);
  
  console.log('\nAll Scoring Factors:');
  externalScore.reasons.forEach((reason, index) => {
    console.log(`  ${index + 1}. ${reason}`);
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Component scores breakdown
  console.log('3. Component Scores Breakdown:');
  Object.entries(externalScore.componentScores).forEach(([component, data]) => {
    console.log(`  ${component.replace(/([A-Z])/g, ' $1')}: ${data.score}/50`);
  });
  
  console.log('\n=== Test Complete ===');
}).catch(error => {
  console.error('Error testing scoring engine with external data:', error);
});