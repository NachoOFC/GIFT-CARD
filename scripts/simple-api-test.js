// Simple test usando Node.js fetch
async function testAPI() {
  try {
    console.log('🧪 TEST 1: Comprador != Beneficiario');
    
    const response1 = await fetch('http://localhost:3000/api/giftcard/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: `ORDER-${Date.now()}-DIFF`,
        monto: 15000,
        email_destinatario: 'beneficiario@test.com',
        email_comprador: 'comprador@test.com',
        customer_name: 'Juan Comprador',
        beneficiary_name: 'María Beneficiaria'
      })
    });

    const result1 = await response1.text();
    console.log('📤 Respuesta TEST 1:', result1.substring(0, 200) + '...');

    console.log('\n🔄 TEST 2: Comprador = Beneficiario');
    
    const response2 = await fetch('http://localhost:3000/api/giftcard/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: `ORDER-${Date.now()}-SAME`,
        monto: 25000,
        email_destinatario: 'mismo@test.com',
        customer_name: 'Carlos Mismo',
        beneficiary_name: 'Carlos Mismo'
      })
    });

    const result2 = await response2.text();
    console.log('📤 Respuesta TEST 2:', result2.substring(0, 200) + '...');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();