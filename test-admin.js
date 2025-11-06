const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    // Login as admin
    const loginResponse = await fetch('http://localhost:52093/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Admin login response:', loginData);
    
    if (!loginData.token) {
      console.log('Failed to login as admin');
      return;
    }
    
    const token = loginData.token;
    
    // Test admin users endpoint
    const usersResponse = await fetch('http://localhost:52093/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const usersData = await usersResponse.json();
    console.log('Admin users response:', usersData);
    
    // Test getting a specific user
    if (usersData.users && usersData.users.length > 0) {
      const userId = usersData.users[0].id;
      console.log('Testing user details for user ID:', userId);
      
      const userResponse = await fetch(`http://localhost:52093/api/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const userData = await userResponse.json();
      console.log('Admin user details response:', userData);
    }
  } catch (error) {
    console.error('Error testing admin API:', error);
  }
}

testAdminAPI();