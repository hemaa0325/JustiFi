// Test script to debug the assessment issue
const { getUserById, getDocumentsByUserId, getTransactionsByUserId } = require('./backend/db/fileDatabase');
const { calculateScoreWithExternalData } = require('./backend/utils/scoringEngine');

async function testAssessment() {
  try {
    console.log('Testing assessment for user: mhozqlzhxe4pfccwms');
    
    // Get user
    const user = await getUserById('mhozqlzhxe4pfccwms');
    console.log('User:', user);
    
    // Get documents
    const documents = await getDocumentsByUserId('mhozqlzhxe4pfccwms');
    console.log('Documents:', documents);
    
    // Get transactions
    const transactions = await getTransactionsByUserId('mhozqlzhxe4pfccwms');
    console.log('Transactions:', transactions);
    
    // Prepare user data for scoring
    const userData = {
      userProfile: {
        ...user,
        fullName: user.fullName || user.full_name || ''
      },
      documents,
      transactions
    };
    
    console.log('User data for scoring:', userData);
    
    // Calculate score
    const assessmentResult = await calculateScoreWithExternalData(userData);
    console.log('Assessment result:', assessmentResult);
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testAssessment();