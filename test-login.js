const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login API endpoint...');
  
  try {
    const response = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'marcosnehemias19@gmail.com',
      password: '12345678'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login Response Status:', response.status);
    console.log('✅ Login Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Login Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
