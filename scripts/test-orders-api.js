const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function testOrdersAPI() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🧪 PROBANDO APIS DE ORDERS CON NUEVA LÓGICA');
    console.log('=' * 50);

    // Obtener IDs de usuarios de prueba
    const [users] = await connection.query(
      'SELECT id, nombre, gmail FROM usuarios WHERE gmail LIKE "%@test.com" ORDER BY gmail'
    );

    console.log('👥 Usuarios de prueba encontrados:');
    users.forEach(user => {
      console.log(`  - ${user.nombre} (${user.gmail}): ID ${user.id}`);
    });

    for (const user of users) {
      console.log(`\n🔍 PROBANDO USUARIO: ${user.nombre} (${user.gmail})`);
      console.log('-'.repeat(50));

      // Test 1: API de órdenes (historial)
      try {
        const ordersResponse = await fetch(`http://localhost:3000/api/orders?userId=${user.id}&type=orders`);
        const ordersData = await ordersResponse.json();
        
        console.log(`📝 HISTORIAL DE ÓRDENES (${ordersData.data?.length || 0} items):`);
        if (ordersData.success && ordersData.data?.length > 0) {
          ordersData.data.forEach((order, index) => {
            console.log(`  ${index + 1}. Orden: ${order.numero_orden}`);
            console.log(`     Rol: ${order.user_role} (${order.role_description})`);
            console.log(`     Gift Card: ${order.has_gift_card}`);
            console.log(`     Total: $${order.total}`);
          });
        } else {
          console.log('  Sin órdenes en historial');
        }
      } catch (error) {
        console.log(`  ❌ Error obteniendo órdenes: ${error.message}`);
      }

      // Test 2: API de gift cards
      try {
        const giftCardsResponse = await fetch(`http://localhost:3000/api/orders?userId=${user.id}`);
        const giftCardsData = await giftCardsResponse.json();
        
        console.log(`🎁 GIFT CARDS DISPONIBLES (${giftCardsData.data?.length || 0} items):`);
        if (giftCardsData.success && giftCardsData.data?.length > 0) {
          giftCardsData.data.forEach((gc, index) => {
            console.log(`  ${index + 1}. Código: ${gc.codigo}`);
            console.log(`     Saldo: $${gc.saldo_actual} de $${gc.valor_inicial}`);
            console.log(`     Origen: ${gc.gift_card_source || 'N/A'}`);
            console.log(`     Estado: ${gc.activa ? 'Activa' : 'Inactiva'}`);
          });
        } else {
          console.log('  Sin gift cards disponibles');
        }
      } catch (error) {
        console.log(`  ❌ Error obteniendo gift cards: ${error.message}`);
      }
    }

    console.log('\n✅ Prueba de APIs completada');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

testOrdersAPI();