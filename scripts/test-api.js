async function testAPI() {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    console.log('🔍 Probando API de gift cards...');
    
    // Test 1: Obtener gift cards existentes
    console.log('\n📋 Test 1: Obtener gift cards existentes');
    const getResponse = await fetch(`${baseURL}/gift-cards`);
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getData, null, 2));
    
    // Test 2: Verificar código existente
    console.log('\n🔍 Test 2: Verificar código existente');
    const checkResponse = await fetch(`${baseURL}/gift-cards?codigo=NODE-TEST-1`);
    const checkData = await checkResponse.json();
    console.log('Status:', checkResponse.status);
    console.log('Response:', JSON.stringify(checkData, null, 2));
    
    // Test 3: Crear nueva gift card
    console.log('\n➕ Test 3: Crear nueva gift card');
    const newGiftCard = {
      codigo: 'TEST-' + Date.now(),
      valor_inicial: 5000,
      fecha_expiracion: '2025-12-31',
      email_destinatario: 'test@example.com',
      mensaje: 'Gift card de prueba',
      empresa: 'Test Company'
    };
    
    const createResponse = await fetch(`${baseURL}/gift-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGiftCard)
    });
    
    const createData = await createResponse.json();
    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createData, null, 2));
    
    if (createData.success) {
      console.log('✅ Gift card creada exitosamente!');
    } else {
      console.log('❌ Error al crear gift card');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  }
}

testAPI();
