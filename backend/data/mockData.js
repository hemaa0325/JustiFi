// Mock user data for demonstration
const mockUsers = [
  {
    id: '9',  // Matches Alice Johnson's ID in database
    name: 'Alice Johnson',
    riskLevel: 'medium',
    receipts: [
      // Adjusted for score of 60 - medium risk profile
      { id: 'receipt-1', date: '2025-10-01', amount: 200, merchant: 'Salary' },
      { id: 'receipt-2', date: '2025-10-05', amount: -25, merchant: 'Refund' },
      { id: 'receipt-3', date: '2025-10-09', amount: 100, merchant: 'Grocery' },
      { id: 'receipt-4', date: '2025-10-13', amount: 60, merchant: 'Mobile' },
      { id: 'receipt-5', date: '2025-10-17', amount: 50, merchant: 'Market' },
      { id: 'receipt-6', date: '2025-10-21', amount: 150, merchant: 'Salary' },
      { id: 'receipt-7', date: '2025-10-25', amount: -15, merchant: 'Refund' },
      { id: 'receipt-8', date: '2025-10-29', amount: 80, merchant: 'Grocery' }
    ]
  },
  {
    id: '10',  // Matches Bob Smith's ID in database
    name: 'Bob Smith',
    riskLevel: 'high',
    receipts: [
      // Adjusted for score of 20 - high risk profile
      { id: 'receipt-1', date: '2025-10-01', amount: 100, merchant: 'Income' },
      { id: 'receipt-2', date: '2025-10-08', amount: -30, merchant: 'Refund' },
      { id: 'receipt-3', date: '2025-10-15', amount: 70, merchant: 'Shopping' },
      { id: 'receipt-4', date: '2025-10-22', amount: -25, merchant: 'Refund' },
      { id: 'receipt-5', date: '2025-10-29', amount: -15, merchant: 'Refund' }
    ]
  },
  {
    id: '11',  // Matches Charlie Brown's ID in database
    name: 'Charlie Brown',
    riskLevel: 'medium',
    receipts: [
      // Adjusted for score of 50 - medium risk profile
      { id: 'receipt-1', date: '2025-10-01', amount: 180, merchant: 'Salary' },
      { id: 'receipt-2', date: '2025-10-06', amount: -10, merchant: 'Refund' },
      { id: 'receipt-3', date: '2025-10-11', amount: 90, merchant: 'Electronics' },
      { id: 'receipt-4', date: '2025-10-16', amount: 70, merchant: 'Grocery' },
      { id: 'receipt-5', date: '2025-10-21', amount: 50, merchant: 'Clothing' },
      { id: 'receipt-6', date: '2025-10-26', amount: 40, merchant: 'Mobile' },
      { id: 'receipt-7', date: '2025-10-31', amount: 80, merchant: 'Electronics' }
    ]
  },
  {
    id: '12',  // Matches Diana Wilson's ID in database (banker - won't be shown)
    name: 'Diana Wilson',
    riskLevel: 'medium',
    receipts: [
      // Inconsistent spending pattern with large transactions - should result in medium score
      { id: 'receipt-1', date: '2025-10-01', amount: 800, merchant: 'Electronics Store' },
      { id: 'receipt-2', date: '2025-10-05', amount: 150, merchant: 'Grocery Store' },
      { id: 'receipt-3', date: '2025-10-10', amount: 650, merchant: 'Clothing Store' },
      { id: 'receipt-4', date: '2025-10-12', amount: 90, merchant: 'Vegetable Market' },
      { id: 'receipt-5', date: '2025-10-15', amount: 420, merchant: 'Electronics Store' },
      { id: 'receipt-6', date: '2025-10-20', amount: 180, merchant: 'Grocery Store' },
      { id: 'receipt-7', date: '2025-10-25', amount: 550, merchant: 'Clothing Store' },
      { id: 'receipt-8', date: '2025-10-28', amount: 120, merchant: 'Vegetable Market' }
    ]
  },
  {
    id: '13',  // Matches Eric Davis's ID in database (admin - won't be shown)
    name: 'Eric Davis',
    riskLevel: 'high',
    receipts: [
      // Few transactions with refunds - should result in low score (high risk)
      { id: 'receipt-1', date: '2025-10-01', amount: 750, merchant: 'Electronics Store' },
      { id: 'receipt-2', date: '2025-10-05', amount: -200, merchant: 'Refund - Electronics Store' },
      { id: 'receipt-3', date: '2025-10-15', amount: -150, merchant: 'Refund - Electronics Store' },
      { id: 'receipt-4', date: '2025-10-25', amount: 500, merchant: 'Clothing Store' }
    ]
  },
  {
    id: '14',  // Matches hmm's ID in database
    name: 'hmm',
    riskLevel: 'high',
    receipts: [
      // Very few transactions - should result in low score (high risk)
      { id: 'receipt-1', date: '2025-10-01', amount: 1000, merchant: 'Salary Credit' },
      { id: 'receipt-2', date: '2025-10-15', amount: 800, merchant: 'Electronics Store' }
    ]
  }
];

module.exports = { mockUsers };