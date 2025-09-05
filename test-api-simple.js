// Simple API test
async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    const response = await fetch('http://localhost:3001/api/mongodb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'find',
        table: 'students',
        query: {},
        limit: 5
      })
    });

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.data && result.data.length > 0) {
      console.log('✅ API working! Found', result.data.length, 'students');
    } else {
      console.log('⚠️ API working but no data found');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();