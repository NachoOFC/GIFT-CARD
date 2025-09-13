const mysql = require('mysql2/promise');

async function testPurchaseLogic() {
  console.log('🧪 TESTING LÓGICA DE COMPRAS VS BENEFICIARIOS');
  console.log('===============================================');

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
  };

  try {
    const connection = await mysql.createConnection(config);

    // Ver user_orders para entender la lógica actual
    console.log('\n📊 ANÁLISIS DE USER_ORDERS:');
    console.log('=================================');

    const [userOrders] = await connection.query(`
      SELECT 
        uo.id,
        uo.user_id,
        uo.gift_card_codes,
        uo.total_amount,
        uo.tipo,
        u.gmail as user_email
      FROM user_orders uo
      JOIN usuarios u ON uo.user_id = u.id
      ORDER BY uo.id DESC
      LIMIT 10
    `);

    userOrders.forEach(order => {
      console.log(`
🔍 User Order #${order.id}:
   👤 Usuario: ${order.user_email}
   🎯 Tipo: ${order.tipo}
   💰 Monto: $${order.total_amount}
   🎁 Gift Card: ${order.gift_card_codes || 'N/A'}
   ${order.tipo === 'beneficiario' && order.total_amount > 0 ? '❌ ERROR: Beneficiario no debería tener monto!' : ''}
   ${order.tipo === 'comprador' && order.gift_card_codes ? '❌ ERROR: Comprador no debería tener gift card!' : ''}
      `);
    });

    // Verificar estadísticas por usuario
    console.log('\n📊 ESTADÍSTICAS POR USUARIO:');
    console.log('===============================');

    const [userStats] = await connection.query(`
      SELECT 
        u.gmail,
        u.nombre,
        SUM(CASE WHEN uo.tipo IN ('comprador', 'comprador_beneficiario') THEN uo.total_amount ELSE 0 END) as dinero_gastado,
        COUNT(CASE WHEN uo.gift_card_codes IS NOT NULL THEN 1 END) as gift_cards_disponibles,
        COUNT(CASE WHEN uo.tipo = 'comprador' THEN 1 END) as compras_como_comprador,
        COUNT(CASE WHEN uo.tipo = 'beneficiario' THEN 1 END) as gift_cards_recibidas,
        COUNT(CASE WHEN uo.tipo = 'comprador_beneficiario' THEN 1 END) as autocompras
      FROM usuarios u
      LEFT JOIN user_orders uo ON u.id = uo.user_id
      GROUP BY u.id, u.gmail, u.nombre
      HAVING dinero_gastado > 0 OR gift_cards_disponibles > 0
    `);

    userStats.forEach(stat => {
      console.log(`
👤 ${stat.gmail}:
   💰 Dinero gastado: $${stat.dinero_gastado}
   🎁 Gift cards disponibles: ${stat.gift_cards_disponibles}
   🛒 Compras realizadas: ${stat.compras_como_comprador}
   🎁 Gift cards recibidas: ${stat.gift_cards_recibidas}
   🔄 Autocompras: ${stat.autocompras}
      `);
    });

    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('\n💡 REGLAS CORRECTAS:');
    console.log('  - Compradores: tienen total_amount > 0, gift_card_codes = NULL');
    console.log('  - Beneficiarios: tienen total_amount = 0, gift_card_codes != NULL');
    console.log('  - Comprador_beneficiario: tienen total_amount > 0, gift_card_codes != NULL');

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  testPurchaseLogic();
}

module.exports = testPurchaseLogic;