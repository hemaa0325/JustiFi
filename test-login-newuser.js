const fetch = require('node-fetch');

async function testLogin() {
  try {
    // First, signup a new user
    const signupResponse = await fetch('http://localhost:52093/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpassword123'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData);
    
    // Then, login with the new user
    const loginResponse = await fetch('http://localhost:52093/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'newuser',
        password: 'newpassword123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();