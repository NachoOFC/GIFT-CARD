// Test script para verificar la funcionalidad de consulta de saldo
const fetch = require('node-fetch');

async function testBalanceEndpoint() {
  try {
    // Simular una consulta con email de prueba
    const testEmail = 'test@example.com';
    const response = await fetch(`http://localhost:3000/api/gift-cards/saldo?email=${encodeURIComponent(testEmail)}`);
    const data = await response.json();
    
    console.log('🔍 Testing Balance Endpoint:');
    console.log('📧 Email:', testEmail);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Endpoint funcionando correctamente');
      console.log('💰 Saldo Total:', data.saldoTotal || 0);
      console.log('🎁 Gift Cards:', data.giftCards?.length || 0);
      console.log('📈 Stats:', data.userStats);
    } else {
      console.log('⚠️ Endpoint retornó error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error al probar endpoint:', error.message);
  }
}

testBalanceEndpoint();