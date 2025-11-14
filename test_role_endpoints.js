const http = require('http');

// Function to make HTTP requests
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test login and role-specific endpoints
async function testRoleEndpoints() {
  try {
    console.log('Testing login and role-specific endpoints...\n');
    
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginData = JSON.stringify({
      identifier: 'admin',
      password: 'admin123'
    });
    
    const adminLoginResponse = await makeRequest({
      hostname: 'localhost',
      port: 52095,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': adminLoginData.length
      }
    }, adminLoginData);
    
    console.log('Admin login status:', adminLoginResponse.statusCode);
    const adminLoginResult = JSON.parse(adminLoginResponse.data);
    console.log('Admin login message:', adminLoginResult.message);
    
    if (adminLoginResult.token) {
      console.log('Admin token received\n');
      
      // 2. Test admin-specific endpoint
      console.log('2. Testing admin-specific endpoint (/api/admin/users)...');
      const adminUsersResponse = await makeRequest({
        hostname: 'localhost',
        port: 52095,
        path: '/api/admin/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminLoginResult.token}`
        }
      });
      
      console.log('Admin users endpoint status:', adminUsersResponse.statusCode);
      if (adminUsersResponse.statusCode === 200) {
        console.log('Admin users endpoint: SUCCESS\n');
      } else {
        console.log('Admin users endpoint: FAILED\n');
        console.log('Response:', adminUsersResponse.data);
      }
    }
    
    // 3. Login as banker
    console.log('3. Logging in as banker...');
    const bankerLoginData = JSON.stringify({
      identifier: 'banker',
      password: 'banker123'
    });
    
    const bankerLoginResponse = await makeRequest({
      hostname: 'localhost',
      port: 52095,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': bankerLoginData.length
      }
    }, bankerLoginData);
    
    console.log('Banker login status:', bankerLoginResponse.statusCode);
    const bankerLoginResult = JSON.parse(bankerLoginResponse.data);
    console.log('Banker login message:', bankerLoginResult.message);
    
    if (bankerLoginResult.token) {
      console.log('Banker token received\n');
      
      // 4. Test banker-specific endpoint
      console.log('4. Testing banker-specific endpoint (/api/banker/users)...');
      const bankerUsersResponse = await makeRequest({
        hostname: 'localhost',
        port: 52095,
        path: '/api/banker/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bankerLoginResult.token}`
        }
      });
      
      console.log('Banker users endpoint status:', bankerUsersResponse.statusCode);
      if (bankerUsersResponse.statusCode === 200) {
        console.log('Banker users endpoint: SUCCESS\n');
      } else {
        console.log('Banker users endpoint: FAILED\n');
        console.log('Response:', bankerUsersResponse.data);
      }
    }
    
    // 5. Login as regular user
    console.log('5. Logging in as regular user...');
    const userLoginData = JSON.stringify({
      identifier: 'user',
      password: 'user123'
    });
    
    const userLoginResponse = await makeRequest({
      hostname: 'localhost',
      port: 52095,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': userLoginData.length
      }
    }, userLoginData);
    
    console.log('User login status:', userLoginResponse.statusCode);
    const userLoginResult = JSON.parse(userLoginResponse.data);
    console.log('User login message:', userLoginResult.message);
    
    if (userLoginResult.token) {
      console.log('User token received\n');
      
      // 6. Test that user cannot access banker endpoint
      console.log('6. Testing that user cannot access banker endpoint...');
      const userBankerUsersResponse = await makeRequest({
        hostname: 'localhost',
        port: 52095,
        path: '/api/banker/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userLoginResult.token}`
        }
      });
      
      console.log('User accessing banker endpoint status:', userBankerUsersResponse.statusCode);
      if (userBankerUsersResponse.statusCode === 403) {
        console.log('User properly blocked from banker endpoint: SUCCESS\n');
      } else {
        console.log('User should have been blocked from banker endpoint: FAILED\n');
      }
    }
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testRoleEndpoints();