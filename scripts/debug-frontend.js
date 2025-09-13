console.log('🔍 DEBUGGING FRONTEND - PERFIL DE USUARIO');
console.log('=========================================');

// 1. Verificar localStorage
console.log('📦 localStorage:');
const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
  const userData = JSON.parse(currentUser);
  console.log('   Usuario almacenado:', userData);
  console.log('   ID:', userData.id);
  console.log('   Email:', userData.gmail || userData.email);
  console.log('   Nombre:', userData.nombre);
} else {
  console.log('   ❌ No hay usuario en localStorage');
}

// 2. Probar APIs directamente
if (currentUser) {
  const userData = JSON.parse(currentUser);
  const userId = userData.id;
  
  console.log(`\n🔗 Probando APIs para usuario ID: ${userId}`);
  
  // API de gift cards
  fetch(`/api/orders?userId=${userId}`)
    .then(response => response.json())
    .then(data => {
      console.log(`🎁 Gift Cards API (${data.data?.length || 0} items):`, data);
      if (data.data && data.data.length > 0) {
        data.data.forEach((gc, idx) => {
          console.log(`   ${idx + 1}. ${gc.codigo} - $${gc.valor_inicial}`);
        });
      }
    })
    .catch(err => console.error('❌ Error gift cards:', err));

  // API de órdenes
  fetch(`/api/orders?userId=${userId}&type=orders`)
    .then(response => response.json())
    .then(data => {
      console.log(`📝 Orders API (${data.data?.length || 0} items):`, data);
      if (data.data && data.data.length > 0) {
        data.data.forEach((order, idx) => {
          console.log(`   ${idx + 1}. ${order.numero_orden} - $${order.total} - ${order.user_role}`);
        });
      }
    })
    .catch(err => console.error('❌ Error orders:', err));
}

console.log('\n💡 INSTRUCCIONES:');
console.log('1. Abre las herramientas de desarrollador (F12)');
console.log('2. Ve a la pestaña Console');
console.log('3. Pega este código y presiona Enter');
console.log('4. Revisa los resultados para ver qué está pasando');