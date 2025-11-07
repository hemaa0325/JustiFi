// Test script to simulate frontend behavior
const fetch = require('node-fetch');

async function testFrontendSimulation() {
  try {
    console.log('Testing frontend simulation...');
    
    // Simulate getting current user from localStorage
    const mockUser = {
      id: 'mhozqlzhxe4pfccwms',
      username: 'newuser',
      email: 'newuser@example.com',
      fullName: 'New User',
      role: 'user'
    };
    
    console.log('Current user:', mockUser);
    
    // Test the assessment endpoint directly
    console.log('Testing assessment endpoint...');
    const response = await fetch('http://localhost:52093/api/assess/user/mhozqlzhxe4pfccwms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'mhozqlzhxe4pfccwms'
      }),
    });
    
    const result = await response.json();
    console.log('Assessment result:', result);
    
    if (response.ok) {
      console.log('✅ Assessment endpoint works correctly');
    } else {
      console.log('❌ Assessment endpoint failed:', result.error);
    }
  } catch (error) {
    console.error('Error in frontend simulation:', error);
  }
}

testFrontendSimulation();