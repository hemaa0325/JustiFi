const fetch = require('node-fetch');

async function testBankerAPI() {
  try {
    // Test banker users endpoint
    const usersResponse = await fetch('http://localhost:52093/api/banker/users', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJhbmtlci0xIiwidXNlcm5hbWUiOiJiYW5rZXIiLCJyb2xlIjoiYmFua2VyIiwiaWF0IjoxNzYyNDQ5NTk3LCJleHAiOjE3NjI1MzU5OTd9.9mD2BD0j5R5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5',
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