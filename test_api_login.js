const http = require('http');

// Test data - using the actual credentials from the database
const testData = {
  admin1: { identifier: 'admin', password: 'admin123' }, // This should match the user with email admin@justifi.com
  banker: { identifier: 'banker', password: 'banker123' },
  user: { identifier: 'user', password: 'user123' }
};

// Function to test login
function testLogin(userType, userData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(userData);
    
    const options = {
      hostname: 'localhost',
      port: 52095,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`${userType} login response:`, responseData);
        resolve(responseData);
      });
    });
    
    req.on('error', (error) => {
      console.error(`${userType} login error:`, error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Test all user types
async function testAllLogins() {
  console.log('Testing login for all user types...\n');
  
  for (const [userType, userData] of Object.entries(testData)) {
    try {
      await testLogin(userType, userData);
    } catch (error) {
      console.error(`Error testing ${userType} login:`, error);
    }
  }
}

testAllLogins();