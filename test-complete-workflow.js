// Test script to simulate the complete upload and assessment workflow
const fs = require('fs');
const path = require('path');

async function testCompleteWorkflow() {
  try {
    console.log('Testing complete workflow...');
    
    // Create a mock file
    const mockFileContent = 'Mock file content for testing';
    const mockFilePath = path.join(__dirname, 'mock-document.txt');
    fs.writeFileSync(mockFilePath, mockFileContent);
    
    // Simulate file upload
    console.log('Simulating file upload...');
    
    // In a real scenario, we would use FormData and fetch to upload the file
    // But for this test, we'll directly call the backend function
    
    // Test the assessment directly
    console.log('Testing assessment directly...');
    const { getUserById } = require('./backend/db/fileDatabase');
    const { calculateScoreWithExternalData } = require('./backend/utils/scoringEngine');
    
    const userId = 'mhozqlzhxe4pfccwms';
    const user = await getUserById(userId);
    
    console.log('User:', user);
    
    // Prepare user data for scoring
    const userData = {
      userProfile: {
        ...user,
        fullName: user.fullName || user.full_name || ''
      },
      documents: [], // No documents uploaded
      transactions: [] // No transactions
    };
    
    // Calculate score
    const assessmentResult = await calculateScoreWithExternalData(userData);
    console.log('Assessment result:', assessmentResult);
    
    // Clean up
    fs.unlinkSync(mockFilePath);
    
    console.log('✅ Complete workflow test finished');
  } catch (error) {
    console.error('Error in complete workflow test:', error);
  }
}

testCompleteWorkflow();