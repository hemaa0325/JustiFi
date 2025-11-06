const { mockUsers } = require('./backend/data/mockData');
const { calculateScore } = require('./backend/utils/scoringEngine');

console.log('Credit Scores with New Risk Categories:');
console.log('=====================================');

mockUsers.forEach(user => {
  const result = calculateScore(user.receipts);
  console.log(`\n${user.name} (${user.riskLevel} risk):`);
  console.log(`  Credit Score: ${result.score}`);
  console.log(`  Decision: ${result.decision}`);
  console.log(`  Loan Amount: ${result.loanAmount}`);
  console.log(`  Message: ${result.message}`);
});

console.log('\nSummary by Risk Category:');
console.log('========================');
const riskCategories = { low: [], medium: [], high: [] };

mockUsers.forEach(user => {
  const result = calculateScore(user.receipts);
  let category;
  if (result.score >= 75) {
    category = 'Low Risk (75+)';
  } else if (result.score >= 50) {
    category = 'Medium Risk (50-74)';
  } else {
    category = 'High Risk (<50)';
  }
  riskCategories[user.riskLevel].push(`${user.name}: ${result.score} (${category})`);
});

Object.keys(riskCategories).forEach(category => {
  console.log(`\n${category.toUpperCase()} risk users:`);
  riskCategories[category].forEach(user => console.log(`  ${user}`));
});