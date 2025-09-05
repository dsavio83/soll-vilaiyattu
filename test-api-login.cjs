const fetch = require('node-fetch');

async function testAPILogin() {
  try {
    console.log('Testing API login...');
    
    const response = await fetch('http://localhost:3001/api/mongodb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        table: 'users',
        data: {
          username: 'admin',
          password: 'admin123'
        }
      })
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
    
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAPILogin();