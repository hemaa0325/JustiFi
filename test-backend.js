const fetch = require('node-fetch');

async function testBackend() {
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:52093/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);

    // Test signup
    const signupResponse = await fetch('http://localhost:52093/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData);
  } catch (error) {
    console.error('Error testing backend:', error);
  }
}

testBackend();