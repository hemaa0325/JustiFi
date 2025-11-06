const fetch = require('node-fetch');

async function createBankerUser() {
  try {
    // Create a banker user
    const signupResponse = await fetch('http://localhost:50931/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'banker',
        email: 'banker@example.com',
        password: 'banker123',
        fullName: 'Banker User',
        role: 'banker'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('Banker signup response:', signupData);
    
    if (signupData.token) {
      console.log('Banker user created successfully!');
      console.log('Token:', signupData.token);
      console.log('User:', signupData.user);
    } else {
      console.log('Failed to create banker user:', signupData.error);
    }
  } catch (error) {
    console.error('Error creating banker user:', error);
  }
}

createBankerUser();