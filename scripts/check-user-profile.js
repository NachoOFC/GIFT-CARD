const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function checkUserProfile() {
  const connection = await mysql.createConnection(config);

  try {
    const userEmail = 'alexanderviveros9@gmail.com';
    console.log(`🔍 VERIFICANDO PERFIL DE: ${userEmail}`);
    console.log('='*50);

    // Obtener ID del usuario
    const [user] = await connection.query('SELECT id, nombre FROM usuarios WHERE gmail = ?', [userEmail]);
    
    if (user.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const userId = user[0].id;
    console.log(`👤 Usuario: ${user[0].nombre} (ID: ${userId})`);

    // Simular exactamente lo que hace el API de órdenes
    console.log('\n📝 HISTORIAL DE ÓRDENES (API /api/orders?type=orders):');
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

    const [orders] = await connection.query(ordersQuery, [userId]);
    
    console.log(`   Total registros: ${orders.length}`);
    orders.forEach((order, idx) => {
      console.log(`   ${idx + 1}. ${order.numero_orden}`);
      console.log(`      Rol: ${order.user_role} (${order.role_description})`);
      console.log(`      Total: $${order.total.toLocaleString()}`);
      console.log(`      Gift Card: ${order.has_gift_card}`);
      console.log(`      Fecha: ${order.purchase_date}`);
    });

    // Simular exactamente lo que hace el API de gift cards
    console.log('\n🎁 GIFT CARDS DISPONIBLES (API /api/orders sin type):');
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

    const [giftCards] = await connection.query(giftCardsQuery, [userId]);
    
    console.log(`   Total gift cards: ${giftCards.length}`);
    giftCards.forEach((gc, idx) => {
      console.log(`   ${idx + 1}. ${gc.codigo}`);
      console.log(`      Valor: $${gc.valor_inicial.toLocaleString()}`);
      console.log(`      Saldo: $${gc.saldo_actual.toLocaleString()}`);
      console.log(`      Origen: ${gc.gift_card_source}`);
      console.log(`      Estado: ${gc.activa ? 'Activa' : 'Inactiva'}`);
      console.log(`      Expira: ${gc.fecha_expiracion}`);
    });

    console.log('\n🌐 URLs PARA PROBAR:');
    console.log(`   Historial: http://localhost:3000/api/orders?userId=${userId}&type=orders`);
    console.log(`   Gift Cards: http://localhost:3000/api/orders?userId=${userId}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUserProfile();