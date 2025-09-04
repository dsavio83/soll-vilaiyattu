// Simple test script to verify the API is working
const testAPI = async () => {
  try {
    console.log('🧪 Testing MongoDB API...');
    
    // Test fetching students
    const response = await fetch('http://localhost:3001/api/mongodb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'find',
        table: 'students',
        limit: 3
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('❌ API Error:', result.error);
    } else {
      console.log('✅ API Test Successful!');
      console.log(`📊 Found ${result.data.length} students:`);
      result.data.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.admission_number})`);
      });
    }
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
};

testAPI();