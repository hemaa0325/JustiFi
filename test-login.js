const fetch = require('node-fetch');

async function testLogin() {
  try {
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
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();