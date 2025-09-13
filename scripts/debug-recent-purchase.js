const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function debugRecentPurchase() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🔍 INVESTIGANDO TU COMPRA RECIENTE');
    console.log('================================');

    // 1. Verificar las últimas órdenes creadas
    console.log('\n📊 ÚLTIMAS ÓRDENES CREADAS:');
    const [recentOrders] = await connection.query(`
      SELECT 
        id,
        numero_orden,
        email_comprador,
        nombre_comprador,
        total,
        estado,
        fecha_orden,
        TIMESTAMPDIFF(MINUTE, fecha_orden, NOW()) as minutos_hace
      FROM orders 
      ORDER BY fecha_orden DESC 
      LIMIT 10
    `);

    recentOrders.forEach((order, idx) => {
      console.log(`  ${idx + 1}. ID:${order.id} | ${order.numero_orden}`);
      console.log(`     Email: ${order.email_comprador} | $${order.total}`);
      console.log(`     Estado: ${order.estado} | Hace ${order.minutos_hace} minutos`);
    });

    // 2. Verificar si hay gift cards creadas para estas órdenes
    console.log('\n🎁 GIFT CARDS CREADAS RECIENTEMENTE:');
    const [recentGiftCards] = await connection.query(`
      SELECT 
        gc.id,
        gc.codigo,
        gc.valor_inicial,
        gc.email_destinatario,
        gc.order_id,
        o.numero_orden,
        o.email_comprador,
        TIMESTAMPDIFF(MINUTE, gc.fecha_creacion, NOW()) as minutos_hace
      FROM gift_cards gc
      JOIN orders o ON gc.order_id = o.id
      ORDER BY gc.fecha_creacion DESC 
      LIMIT 10
    `);

    if (recentGiftCards.length > 0) {
      recentGiftCards.forEach((gc, idx) => {
        console.log(`  ${idx + 1}. ${gc.codigo} | $${gc.valor_inicial}`);
        console.log(`     Para: ${gc.email_destinatario} | Compró: ${gc.email_comprador}`);
        console.log(`     Orden: ${gc.numero_orden} | Hace ${gc.minutos_hace} minutos`);
      });
    } else {
      console.log('  ❌ NO SE ENCONTRARON GIFT CARDS RECIENTES');
    }

    // 3. Verificar relaciones en user_orders
    console.log('\n🔗 RELACIONES EN USER_ORDERS RECIENTES:');
    const [recentUserOrders] = await connection.query(`
      SELECT 
        uo.id,
        uo.user_id,
        uo.order_id,
        uo.gift_card_codes,
        uo.tipo,
        uo.total_amount,
        u.gmail,
        u.nombre,
        o.numero_orden,
        TIMESTAMPDIFF(MINUTE, uo.purchase_date, NOW()) as minutos_hace
      FROM user_orders uo
      JOIN usuarios u ON uo.user_id = u.id
      JOIN orders o ON uo.order_id = o.id
      ORDER BY uo.purchase_date DESC 
      LIMIT 10
    `);

    if (recentUserOrders.length > 0) {
      recentUserOrders.forEach((uo, idx) => {
        console.log(`  ${idx + 1}. Usuario: ${uo.gmail} (${uo.nombre})`);
        console.log(`     Orden: ${uo.numero_orden} | Tipo: ${uo.tipo}`);
        console.log(`     Gift Card: ${uo.gift_card_codes ? '✅ ' + uo.gift_card_codes : '❌ Sin gift card'}`);
        console.log(`     Monto: $${uo.total_amount} | Hace ${uo.minutos_hace} minutos`);
      });
    } else {
      console.log('  ❌ NO SE ENCONTRARON RELACIONES USER_ORDERS RECIENTES');
    }

    // 4. Verificar si hay usuarios recién creados
    console.log('\n👥 USUARIOS CREADOS RECIENTEMENTE:');
    const [recentUsers] = await connection.query(`
      SELECT 
        id,
        nombre,
        usuario,
        gmail,
        estado,
        TIMESTAMPDIFF(MINUTE, fecha_creacion, NOW()) as minutos_hace
      FROM usuarios 
      ORDER BY fecha_creacion DESC 
      LIMIT 5
    `);

    recentUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.nombre} (${user.gmail})`);
      console.log(`     ID: ${user.id} | Usuario: ${user.usuario} | Estado: ${user.estado}`);
      console.log(`     Creado hace ${user.minutos_hace} minutos`);
    });

    // 5. Diagnóstico específico de la última orden
    if (recentOrders.length > 0) {
      const lastOrder = recentOrders[0];
      console.log(`\n🎯 DIAGNÓSTICO DE LA ÚLTIMA ORDEN: ${lastOrder.numero_orden}`);
      console.log('='.repeat(50));

      // ¿Hay gift card para esta orden?
      const [giftCardForOrder] = await connection.query(
        'SELECT * FROM gift_cards WHERE order_id = ?',
        [lastOrder.id]
      );
      console.log(`Gift card creada: ${giftCardForOrder.length > 0 ? '✅ SÍ' : '❌ NO'}`);

      // ¿Hay usuario con el email comprador?
      const [userExists] = await connection.query(
        'SELECT id, nombre FROM usuarios WHERE gmail = ?',
        [lastOrder.email_comprador]
      );
      console.log(`Usuario existe: ${userExists.length > 0 ? '✅ SÍ (ID: ' + userExists[0].id + ')' : '❌ NO'}`);

      // ¿Hay relación en user_orders?
      if (userExists.length > 0) {
        const [userOrderExists] = await connection.query(
          'SELECT * FROM user_orders WHERE user_id = ? AND order_id = ?',
          [userExists[0].id, lastOrder.id]
        );
        console.log(`Relación user_orders: ${userOrderExists.length > 0 ? '✅ SÍ' : '❌ NO'}`);
      }

      console.log('\n💡 POSIBLES CAUSAS:');
      if (giftCardForOrder.length === 0) {
        console.log('  ❌ No se creó la gift card - revisar API de generación');
      }
      if (userExists.length === 0) {
        console.log('  ❌ No existe el usuario - revisar creación automática de usuarios');
      }
      if (userExists.length > 0) {
        const [userOrderExists] = await connection.query(
          'SELECT * FROM user_orders WHERE user_id = ? AND order_id = ?',
          [userExists[0].id, lastOrder.id]
        );
        if (userOrderExists.length === 0) {
          console.log('  ❌ No se creó la relación user_orders - revisar lógica de vinculación');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugRecentPurchase();