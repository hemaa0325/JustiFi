const fetch = require('node-fetch');

async function testBankerAPI() {
  try {
    // First, login as banker
    const loginResponse = await fetch('http://localhost:52093/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'banker',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.error('Failed to login as banker');
      return;
    }
    
    const token = loginData.token;
    
    // Test banker users endpoint
    const usersResponse = await fetch('http://localhost:52093/api/banker/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const usersData = await usersResponse.json();
    console.log('Banker users response:', usersData);
  } catch (error) {
    console.error('Error testing banker API:', error);
  }
}

testBankerAPI();