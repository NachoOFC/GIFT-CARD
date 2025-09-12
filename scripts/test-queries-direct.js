const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function testOrdersQueries() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🔍 PROBANDO CONSULTAS DIRECTAS DEL API');
    console.log('=' * 50);

    // Obtener IDs de usuarios de prueba
    const [users] = await connection.query(
      'SELECT id, nombre, gmail FROM usuarios WHERE gmail LIKE "%@test.com" ORDER BY gmail'
    );

    for (const user of users) {
      console.log(`\n👤 ${user.nombre} (${user.gmail}) - ID: ${user.id}`);
      console.log('-'.repeat(40));

      // Consulta de órdenes (historial)
      const ordersQuery = `
        SELECT 
          o.*,
          uo.gift_card_codes,
          uo.total_amount,
          uo.purchase_date,
          uo.status as order_status,
          uo.tipo as user_role,
          CASE 
            WHEN uo.tipo = 'comprador' THEN 'Compra realizada'
            WHEN uo.tipo = 'beneficiario' THEN 'Gift card recibida'
            WHEN uo.tipo = 'comprador_beneficiario' THEN 'Compra propia'
            ELSE 'Sin especificar'
          END as role_description,
          CASE 
            WHEN uo.gift_card_codes IS NOT NULL THEN 'Con Gift Card'
            ELSE 'Solo historial'
          END as has_gift_card
        FROM user_orders uo
        JOIN orders o ON uo.order_id = o.id
        WHERE uo.user_id = ?
        ORDER BY uo.purchase_date DESC
      `;

      const [orders] = await connection.query(ordersQuery, [user.id]);
      console.log(`📝 HISTORIAL (${orders.length} registros):`);
      orders.forEach((order, idx) => {
        console.log(`  ${idx + 1}. ${order.numero_orden} - ${order.role_description}`);
        console.log(`     Total: $${order.total} - ${order.has_gift_card}`);
      });

      // Consulta de gift cards disponibles
      const giftCardsQuery = `
        SELECT 
          gc.*,
          uo.purchase_date as fecha_compra,
          uo.status as purchase_status,
          uo.tipo as user_role,
          o.numero_orden,
          o.email_comprador,
          o.nombre_comprador,
          CASE 
            WHEN uo.tipo = 'beneficiario' THEN CONCAT('Recibida de ', o.nombre_comprador)
            WHEN uo.tipo = 'comprador_beneficiario' THEN 'Compra propia'
            ELSE 'Gift card disponible'
          END as gift_card_source
        FROM user_orders uo
        JOIN orders o ON uo.order_id = o.id
        JOIN gift_cards gc ON o.id = gc.order_id
        WHERE uo.user_id = ? AND uo.gift_card_codes IS NOT NULL
        ORDER BY gc.fecha_creacion DESC
      `;

      const [giftCards] = await connection.query(giftCardsQuery, [user.id]);
      console.log(`🎁 GIFT CARDS (${giftCards.length} disponibles):`);
      giftCards.forEach((gc, idx) => {
        console.log(`  ${idx + 1}. ${gc.codigo} - $${gc.saldo_actual}`);
        console.log(`     ${gc.gift_card_source}`);
        console.log(`     Estado: ${gc.activa ? 'Activa' : 'Inactiva'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testOrdersQueries();