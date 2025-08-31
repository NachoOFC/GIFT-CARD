// Script para probar el endpoint directamente
const testData = {
  order_id: 'TEST_' + Date.now(),
  monto: 25000,
  email_destinatario: 'alexanderviveros9@gmail.com',
  customer_name: 'Test Customer'
};

console.log('🧪 Testing API endpoint with data:', testData);

fetch('http://localhost:3000/api/giftcard/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Response status:', response.status);
  console.log('📡 Response headers:', Object.fromEntries(response.headers));
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
})
.then(data => {
  console.log('✅ Success! API Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ Error:', error.message);
  console.error('❌ Full error:', error);
});
