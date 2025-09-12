// Test simple para verificar conectividad con las APIs
const testConnection = async () => {
  console.log('🔍 Testing conectividad con APIs...\n');

  try {
    // Test básico de conectividad
    console.log('1️⃣ Test básico de conectividad...');
    const basicTest = await fetch('http://localhost:3000/api/auth/profile?userId=1');
    console.log('   Status:', basicTest.status);
    console.log('   OK:', basicTest.ok);
    
    if (basicTest.ok) {
      const data = await basicTest.json();
      console.log('   ✅ GET funciona correctamente');
      console.log('   Usuario obtenido:', data.data?.nombre);
    } else {
      console.log('   ❌ GET falló');
    }

    // Test de PUT con datos mínimos
    console.log('\n2️⃣ Test de PUT con datos mínimos...');
    const putTest = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 1,
        nombre: 'Test Update'
      })
    });

    console.log('   Status:', putTest.status);
    console.log('   OK:', putTest.ok);

    if (putTest.ok) {
      const putData = await putTest.json();
      console.log('   ✅ PUT funciona correctamente');
      console.log('   Resultado:', putData.success);
    } else {
      const errorText = await putTest.text();
      console.log('   ❌ PUT falló');
      console.log('   Error:', errorText);
    }

  } catch (error) {
    console.log('❌ Error de conectividad:', error.message);
    console.log('   Tipo de error:', error.name);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   💡 El servidor no está corriendo en puerto 3000');
    } else if (error.message.includes('fetch')) {
      console.log('   💡 Problema con la función fetch');
    }
  }

  console.log('\n🎯 Test completado');
};

testConnection();