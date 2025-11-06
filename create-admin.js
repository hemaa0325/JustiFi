const fetch = require('node-fetch');

async function createAdminUser() {
  try {
    // First, signup as admin
    const signupResponse = await fetch('http://localhost:52093/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('Admin signup response:', signupData);
    
    if (signupData.token) {
      console.log('Admin user created successfully!');
      console.log('Token:', signupData.token);
      console.log('User:', signupData.user);
    } else {
      console.log('Failed to create admin user:', signupData.error);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();