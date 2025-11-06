const fetch = require('node-fetch');

async function testDatabase() {
  try {
    // Test signup
    const signupResponse = await fetch('http://localhost:52093/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'user'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData);
    
    // Test login
    const loginResponse = await fetch('http://localhost:52093/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'testuser',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.token) {
      console.log('Database is working correctly!');
    }
  } catch (error) {
    console.error('Error testing database:', error);
  }
}

testDatabase();