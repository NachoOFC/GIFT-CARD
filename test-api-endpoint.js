const axios = require('axios');

async function testGiftCardAPI() {
  console.log('🧪 Testing Gift Card API endpoint...');
  
  try {
    const response = await axios.post('http://localhost:3002/api/giftcard/generate', {
      order_id: 'TEST_' + Date.now(),
      monto: 25000,
      email_destinatario: 'alexanderviveros9@gmail.com',
      customer_name: 'Test Customer'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGiftCardAPI();
