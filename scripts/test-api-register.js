const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRegisterAPI() {
  try {
    console.log('🧪 Probando la API de registro...');
    
    const testData = {
      nombre: 'Usuario de Prueba',
      usuario: 'test@example.com',
      gmail: 'test@gmail.com',
      password: 'password123'
    };
    
    console.log('📤 Enviando datos:', testData);
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Status de respuesta:', response.status);
    console.log('📊 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Respuesta completa (texto):', responseText);
    
    // Intentar parsear como JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('✅ Respuesta JSON válida:', jsonResponse);
    } catch (jsonError) {
      console.log('❌ Error al parsear JSON:', jsonError.message);
      console.log('🔍 Los primeros 200 caracteres de la respuesta:');
      console.log(responseText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba de API:', error.message);
  }
}

testRegisterAPI();
