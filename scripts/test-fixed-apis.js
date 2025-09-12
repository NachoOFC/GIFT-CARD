// Script para probar las APIs reparadas
console.log('🧪 Probando APIs reparadas...\n');

const testAPIs = async () => {
  try {
    // Test 1: API de perfil GET
    console.log('1️⃣ Testing GET perfil usuario...');
    const profileResponse = await fetch('http://localhost:3000/api/auth/profile?userId=1');
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ GET perfil: OK');
      console.log('   Datos obtenidos:', {
        nombre: profileData.data?.nombre,
        usuario: profileData.data?.usuario,
        gmail: profileData.data?.gmail
      });
    } else {
      console.log('❌ GET perfil: ERROR', profileResponse.status);
    }

    // Test 2: API de órdenes
    console.log('\n2️⃣ Testing GET órdenes...');
    const ordersResponse = await fetch('http://localhost:3000/api/orders?userId=1&type=orders');
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('✅ GET órdenes: OK');
      console.log('   Órdenes encontradas:', ordersData.data?.length || 0);
    } else {
      console.log('❌ GET órdenes: ERROR', ordersResponse.status);
    }

    // Test 3: API de gift cards
    console.log('\n3️⃣ Testing GET gift cards...');
    const giftCardsResponse = await fetch('http://localhost:3000/api/orders?userId=1');
    if (giftCardsResponse.ok) {
      const giftCardsData = await giftCardsResponse.json();
      console.log('✅ GET gift cards: OK');
      console.log('   Gift cards encontradas:', giftCardsData.data?.length || 0);
    } else {
      console.log('❌ GET gift cards: ERROR', giftCardsResponse.status);
    }

    // Test 4: API de actualización de perfil (sin cambios)
    console.log('\n4️⃣ Testing PUT perfil (sin cambios)...');
    const updateResponse = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 1,
        nombre: 'Administrador'
      })
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ PUT perfil: OK');
      console.log('   Update exitoso:', updateData.success);
    } else {
      console.log('❌ PUT perfil: ERROR', updateResponse.status);
      const errorData = await updateResponse.text();
      console.log('   Error:', errorData);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }

  console.log('\n🎉 Testing completado');
};

testAPIs();