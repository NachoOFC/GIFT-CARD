const mysql = require('mysql2/promise');

const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'gift-card'
};

async function checkUserGiftCards() {
  let connection;
  try {
    console.log('🔍 Verificando gift cards de usuarios...\n');
    
    connection = await mysql.createConnection(config);

    // 1. Verificar últimas órdenes
    console.log('1️⃣ Últimas órdenes creadas:');
    const [orders] = await connection.query(`
      SELECT id, numero_orden, email_comprador, nombre_comprador, total, fecha_orden 
      FROM orders 
      ORDER BY fecha_orden DESC 
      LIMIT 5
    `);
    
    orders.forEach(order => {
      console.log(`   📦 ${order.numero_orden} - ${order.email_comprador} - $${order.total}`);
    });

    // 2. Verificar últimas gift cards
    console.log('\n2️⃣ Últimas gift cards creadas:');
    const [giftCards] = await connection.query(`
      SELECT id, codigo, valor_inicial, email_destinatario, fecha_creacion, order_id
      FROM gift_cards 
      ORDER BY fecha_creacion DESC 
      LIMIT 5
    `);
    
    giftCards.forEach(gc => {
      console.log(`   🎁 ${gc.codigo} - $${gc.valor_inicial} - ${gc.email_destinatario} (Order: ${gc.order_id})`);
    });

    // 3. Verificar relaciones user_orders
    console.log('\n3️⃣ Relaciones user_orders:');
    const [userOrders] = await connection.query(`
      SELECT 
        uo.id,
        uo.user_id,
        u.nombre as usuario_nombre,
        u.gmail as usuario_email,
        uo.gift_card_codes,
        uo.total_amount,
        uo.purchase_date
      FROM user_orders uo
      JOIN usuarios u ON uo.user_id = u.id
      ORDER BY uo.purchase_date DESC
      LIMIT 5
    `);
    
    userOrders.forEach(uo => {
      console.log(`   🔗 Usuario: ${uo.usuario_nombre} (${uo.usuario_email}) - ${uo.gift_card_codes} - $${uo.total_amount}`);
    });

    // 4. Verificar usuarios recientes
    console.log('\n4️⃣ Usuarios creados recientemente:');
    const [users] = await connection.query(`
      SELECT id, nombre, usuario, gmail, fecha_registro
      FROM usuarios 
      ORDER BY fecha_registro DESC 
      LIMIT 5
    `);
    
    users.forEach(user => {
      console.log(`   👤 ${user.nombre} (@${user.usuario}) - ${user.gmail} - ID: ${user.id}`);
    });

    // 5. Verificar join completo para un usuario específico
    console.log('\n5️⃣ Gift cards por usuario (ejemplo con últimos usuarios):');
    
    if (users.length > 0) {
      const testUserId = users[0].id;
      const [userGiftCardsData] = await connection.query(`
        SELECT 
          gc.codigo,
          gc.valor_inicial,
          gc.saldo_actual,
          gc.fecha_creacion,
          uo.purchase_date,
          uo.status
        FROM user_orders uo
        JOIN orders o ON uo.order_id = o.id
        JOIN gift_cards gc ON o.id = gc.order_id
        WHERE uo.user_id = ?
        ORDER BY gc.fecha_creacion DESC
      `, [testUserId]);

      console.log(`   Usuario ${users[0].nombre} tiene ${userGiftCardsData.length} gift cards:`);
      userGiftCardsData.forEach(gc => {
        console.log(`     🎁 ${gc.codigo} - $${gc.valor_inicial} (${gc.status})`);
      });
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUserGiftCards();