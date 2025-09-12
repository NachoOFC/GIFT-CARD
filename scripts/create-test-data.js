const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function createTestData() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🛠️ CREANDO DATOS DE PRUEBA PARA LÓGICA COMPRADOR/BENEFICIARIO');
    console.log('=' * 60);

    // Limpiar datos de prueba anteriores
    await connection.query('DELETE FROM user_orders WHERE user_id IN (SELECT id FROM usuarios WHERE gmail LIKE "%@test.com")');
    await connection.query('DELETE FROM gift_cards WHERE email_destinatario LIKE "%@test.com"');
    await connection.query('DELETE FROM orders WHERE email_comprador LIKE "%@test.com"');
    await connection.query('DELETE FROM usuarios WHERE gmail LIKE "%@test.com"');
    await connection.query('DELETE FROM beneficiarios WHERE email LIKE "%@test.com"');
    
    console.log('✅ Datos de prueba anteriores eliminados');

    // Crear usuarios de prueba
    const [buyerResult] = await connection.query(
      'INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      ['Juan Comprador', 'comprador', 'comprador@test.com', 'temp123', 'user', 1]
    );
    const buyerId = buyerResult.insertId;

    const [beneficiaryResult] = await connection.query(
      'INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      ['Maria Beneficiaria', 'beneficiaria', 'beneficiario@test.com', 'temp123', 'user', 1]
    );
    const beneficiaryId = beneficiaryResult.insertId;

    const [samePersonResult] = await connection.query(
      'INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      ['Carlos Mismo', 'mismo', 'mismo@test.com', 'temp123', 'user', 1]
    );
    const samePersonId = samePersonResult.insertId;

    console.log(`✅ Usuarios creados: Comprador(${buyerId}), Beneficiario(${beneficiaryId}), Mismo(${samePersonId})`);

    // ESCENARIO 1: Comprador != Beneficiario
    const orderNumber1 = `ORDER-${Date.now()}-MANUAL1`;
    const [orderResult1] = await connection.query(
      'INSERT INTO orders (numero_orden, email_comprador, nombre_comprador, total, estado, metodo_pago, fecha_orden) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [orderNumber1, 'comprador@test.com', 'Juan Comprador', 15000, 'pagado', 'webpay']
    );
    const orderId1 = orderResult1.insertId;

    const giftCardCode1 = `GC-${orderNumber1}-TEST`;
    const expiration1 = new Date();
    expiration1.setFullYear(expiration1.getFullYear() + 1);

    await connection.query(
      'INSERT INTO gift_cards (codigo, valor_inicial, saldo_actual, activa, fecha_expiracion, email_destinatario, empresa, mensaje, order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [giftCardCode1, 15000, 15000, 1, expiration1.toISOString().split('T')[0], 'beneficiario@test.com', 'MLine', 'Gift Card de prueba', orderId1]
    );

    // Beneficiario: tiene gift card
    await connection.query(
      'INSERT INTO user_orders (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
      [beneficiaryId, orderId1, giftCardCode1, 15000, 'active', 'beneficiario']
    );

    // Comprador: solo historial (sin gift_card_codes)
    await connection.query(
      'INSERT INTO user_orders (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
      [buyerId, orderId1, null, 15000, 'active', 'comprador']
    );

    console.log(`✅ Escenario 1 creado: Comprador != Beneficiario (Order: ${orderId1})`);

    // ESCENARIO 2: Comprador = Beneficiario
    const orderNumber2 = `ORDER-${Date.now()}-MANUAL2`;
    const [orderResult2] = await connection.query(
      'INSERT INTO orders (numero_orden, email_comprador, nombre_comprador, total, estado, metodo_pago, fecha_orden) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [orderNumber2, 'mismo@test.com', 'Carlos Mismo', 25000, 'pagado', 'webpay']
    );
    const orderId2 = orderResult2.insertId;

    const giftCardCode2 = `GC-${orderNumber2}-TEST`;
    const expiration2 = new Date();
    expiration2.setFullYear(expiration2.getFullYear() + 1);

    await connection.query(
      'INSERT INTO gift_cards (codigo, valor_inicial, saldo_actual, activa, fecha_expiracion, email_destinatario, empresa, mensaje, order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [giftCardCode2, 25000, 25000, 1, expiration2.toISOString().split('T')[0], 'mismo@test.com', 'MLine', 'Gift Card de prueba propia', orderId2]
    );

    // Una sola relación: comprador_beneficiario con gift card
    await connection.query(
      'INSERT INTO user_orders (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
      [samePersonId, orderId2, giftCardCode2, 25000, 'active', 'comprador_beneficiario']
    );

    console.log(`✅ Escenario 2 creado: Comprador = Beneficiario (Order: ${orderId2})`);

    console.log('\n📋 RESUMEN DE DATOS CREADOS:');
    
    // Verificar comprador
    const [buyerOrders] = await connection.query(
      'SELECT uo.tipo, uo.gift_card_codes, o.numero_orden FROM user_orders uo JOIN orders o ON uo.order_id = o.id WHERE uo.user_id = ?',
      [buyerId]
    );
    console.log(`🛒 Comprador (${buyerId}) tiene ${buyerOrders.length} registros:`);
    buyerOrders.forEach(order => {
      console.log(`  - Tipo: ${order.tipo}, Gift Card: ${order.gift_card_codes ? 'SÍ' : 'NO'}, Orden: ${order.numero_orden}`);
    });

    // Verificar beneficiario
    const [beneficiaryOrders] = await connection.query(
      'SELECT uo.tipo, uo.gift_card_codes, o.numero_orden FROM user_orders uo JOIN orders o ON uo.order_id = o.id WHERE uo.user_id = ?',
      [beneficiaryId]
    );
    console.log(`🎁 Beneficiario (${beneficiaryId}) tiene ${beneficiaryOrders.length} registros:`);
    beneficiaryOrders.forEach(order => {
      console.log(`  - Tipo: ${order.tipo}, Gift Card: ${order.gift_card_codes ? 'SÍ' : 'NO'}, Orden: ${order.numero_orden}`);
    });

    // Verificar persona misma
    const [samePersonOrders] = await connection.query(
      'SELECT uo.tipo, uo.gift_card_codes, o.numero_orden FROM user_orders uo JOIN orders o ON uo.order_id = o.id WHERE uo.user_id = ?',
      [samePersonId]
    );
    console.log(`👤 Mismo (${samePersonId}) tiene ${samePersonOrders.length} registros:`);
    samePersonOrders.forEach(order => {
      console.log(`  - Tipo: ${order.tipo}, Gift Card: ${order.gift_card_codes ? 'SÍ' : 'NO'}, Orden: ${order.numero_orden}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createTestData();