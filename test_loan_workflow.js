const http = require('http');

// Test data
const testUsers = {
  banker: { identifier: 'banker', password: 'banker123' },
  user: { identifier: 'user', password: 'user123' }
};

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

// Test the complete loan workflow
async function testLoanWorkflow() {
  try {
    console.log('Testing complete loan request and approval workflow...\n');
    
    // 1. Login as user
    console.log('1. Logging in as user...');
    const userLoginData = JSON.stringify(testUsers.user);
    
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
    
    if (!userLoginResult.token) {
      console.log('Failed to login as user');
      return;
    }
    
    const userToken = userLoginResult.token;
    const userId = userLoginResult.user.id;
    console.log('User ID:', userId);
    console.log('User token received\n');
    
    // 2. Simulate getting a credit score (this would normally happen after document upload)
    console.log('2. Simulating credit assessment...');
    // In a real scenario, the user would upload documents and get assessed
    // For this test, we'll simulate having a credit score
    
    // 3. Submit a loan request
    console.log('3. Submitting loan request...');
    const loanRequestData = JSON.stringify({
      userId: userId,
      loanAmount: 5000,
      assessmentId: 'test-assessment-id'
    });
    
    const loanRequestResponse = await makeRequest({
      hostname: 'localhost',
      port: 52095,
      path: '/api/assess/user/' + userId + '/loan-request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'Content-Length': loanRequestData.length
      }
    }, loanRequestData);
    
    console.log('Loan request status:', loanRequestResponse.statusCode);
    if (loanRequestResponse.statusCode === 200) {
      const loanRequestResult = JSON.parse(loanRequestResponse.data);
      console.log('Loan request message:', loanRequestResult.message);
      const loanRequestId = loanRequestResult.loanRequest.id;
      console.log('Loan request ID:', loanRequestId);
      console.log('Loan request submitted successfully\n');
      
      // 4. Login as banker
      console.log('4. Logging in as banker...');
      const bankerLoginData = JSON.stringify(testUsers.banker);
      
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
      
      if (!bankerLoginResult.token) {
        console.log('Failed to login as banker');
        return;
      }
      
      const bankerToken = bankerLoginResult.token;
      console.log('Banker token received\n');
      
      // 5. Get loan requests as banker
      console.log('5. Getting loan requests as banker...');
      const getLoanRequestsResponse = await makeRequest({
        hostname: 'localhost',
        port: 52095,
        path: '/api/banker/loan-requests',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bankerToken}`
        }
      });
      
      console.log('Get loan requests status:', getLoanRequestsResponse.statusCode);
      if (getLoanRequestsResponse.statusCode === 200) {
        const loanRequests = JSON.parse(getLoanRequestsResponse.data);
        console.log('Found', loanRequests.length, 'loan requests');
        console.log('Loan requests retrieved successfully\n');
        
        // 6. Approve the loan request
        console.log('6. Approving loan request...');
        const approveLoanData = JSON.stringify({ status: 'approved' });
        
        const approveLoanResponse = await makeRequest({
          hostname: 'localhost',
          port: 52095,
          path: '/api/banker/loan-requests/' + loanRequestId + '/status',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bankerToken}`,
            'Content-Length': approveLoanData.length
          }
        }, approveLoanData);
        
        console.log('Approve loan status:', approveLoanResponse.statusCode);
        if (approveLoanResponse.statusCode === 200) {
          const approveResult = JSON.parse(approveLoanResponse.data);
          console.log('Approve loan message:', approveResult.message);
          console.log('Loan approved successfully\n');
          
          // 7. Verify loan status as user
          console.log('7. Verifying loan status as user...');
          // Re-login as user to get updated token
          const userLoginResponse2 = await makeRequest({
            hostname: 'localhost',
            port: 52095,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': userLoginData.length
            }
          }, userLoginData);
          
          const userLoginResult2 = JSON.parse(userLoginResponse2.data);
          const userToken2 = userLoginResult2.token;
          
          // Get user loan requests
          const getUserLoanRequestsResponse = await makeRequest({
            hostname: 'localhost',
            port: 52095,
            path: '/api/assess/user/' + userId + '/loan-requests',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken2}`
            }
          });
          
          console.log('Get user loan requests status:', getUserLoanRequestsResponse.statusCode);
          if (getUserLoanRequestsResponse.statusCode === 200) {
            const userLoanRequests = JSON.parse(getUserLoanRequestsResponse.data);
            const updatedLoanRequest = userLoanRequests.find(req => req.id === loanRequestId);
            
            if (updatedLoanRequest && updatedLoanRequest.status === 'approved') {
              console.log('Loan status correctly updated to approved');
              console.log('Workflow test PASSED!');
            } else {
              console.log('Loan status not correctly updated');
              console.log('Workflow test FAILED!');
            }
          } else {
            console.log('Failed to get user loan requests');
            console.log('Workflow test FAILED!');
          }
        } else {
          console.log('Failed to approve loan');
          console.log('Workflow test FAILED!');
        }
      } else {
        console.log('Failed to get loan requests');
        console.log('Workflow test FAILED!');
      }
    } else {
      console.log('Failed to submit loan request');
      console.log('Workflow test FAILED!');
    }
  } catch (error) {
    console.error('Error during loan workflow test:', error);
    console.log('Workflow test FAILED!');
  }
}

testLoanWorkflow();