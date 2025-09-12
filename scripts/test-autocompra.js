const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function testAutoCompra() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🎯 PROBANDO: COMPRA PARA MÍ MISMO');
    console.log('===============================');

    // Limpiar datos de prueba anterior
    await connection.query('DELETE FROM user_orders WHERE user_id IN (SELECT id FROM usuarios WHERE gmail LIKE "%autocompra%")');
    await connection.query('DELETE FROM gift_cards WHERE email_destinatario LIKE "%autocompra%"');
    await connection.query('DELETE FROM usuarios WHERE gmail LIKE "%autocompra%"');
    
    // Simular una autocompra
    const email = 'yo@autocompra.com';
    const orderNumber = `ORDER-AUTOCOMPRA-${Date.now()}`;

    console.log(`\n👤 Usuario: ${email}`);
    console.log(`🛒 Orden: ${orderNumber}`);
    console.log(`💰 Monto: $30,000`);

    // 1. Crear usuario
    await connection.query(
      'INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      ['Yo Mismo', 'yomismo', email, 'temp123', 'user', 1]
    );

    const [userResult] = await connection.query('SELECT id FROM usuarios WHERE gmail = ?', [email]);
    const userId = userResult[0].id;

    // 2. Crear orden
    await connection.query(
      'INSERT INTO orders (numero_orden, email_comprador, nombre_comprador, total, estado, metodo_pago, fecha_orden) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [orderNumber, email, 'Yo Mismo', 30000, 'pagado', 'webpay']
    );

    const [orderResult] = await connection.query('SELECT id FROM orders WHERE numero_orden = ?', [orderNumber]);
    const orderId = orderResult[0].id;

    // 3. Crear gift card
    const giftCardCode = `GC-${orderNumber}`;
    await connection.query(
      'INSERT INTO gift_cards (codigo, valor_inicial, saldo_actual, activa, fecha_expiracion, email_destinatario, empresa, mensaje, order_id) VALUES (?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL 1 YEAR), ?, ?, ?, ?)',
      [giftCardCode, 30000, 30000, email, 'MLine', `Gift Card autocompra #${orderNumber}`, orderId]
    );

    // 4. Crear relación user_orders con tipo "comprador_beneficiario"
    await connection.query(
      'INSERT INTO user_orders (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo) VALUES (?, ?, ?, ?, NOW(), "active", "comprador_beneficiario")',
      [userId, orderId, giftCardCode, 30000]
    );

    console.log('✅ Simulación de autocompra completada');

    // 5. Verificar resultado - HISTORIAL
    console.log('\n📋 HISTORIAL (user_orders):');
    const [historial] = await connection.query(`
      SELECT 
        uo.tipo,
        uo.gift_card_codes,
        uo.total_amount,
        uo.purchase_date,
        o.numero_orden,
        o.nombre_comprador,
        CASE 
          WHEN uo.tipo = 'comprador_beneficiario' THEN 'Compra propia - tienes historial Y gift card'
          WHEN uo.tipo = 'beneficiario' THEN 'Gift card recibida'
          WHEN uo.tipo = 'comprador' THEN 'Compra realizada - solo historial'
          ELSE 'Desconocido'
        END as descripcion
      FROM user_orders uo
      JOIN orders o ON uo.order_id = o.id
      WHERE uo.user_id = ?
      ORDER BY uo.purchase_date DESC
    `, [userId]);

    historial.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.descripcion}`);
      console.log(`     - Tipo: ${record.tipo}`);
      console.log(`     - Gift Card: ${record.gift_card_codes ? '✅ ' + record.gift_card_codes : '❌ No tiene'}`);
      console.log(`     - Monto: $${record.total_amount.toLocaleString()}`);
    });

    // 6. Verificar resultado - GIFT CARDS DISPONIBLES
    console.log('\n🎁 GIFT CARDS DISPONIBLES:');
    const [giftCards] = await connection.query(`
      SELECT 
        gc.codigo,
        gc.valor_inicial,
        gc.saldo_actual,
        gc.fecha_expiracion,
        uo.tipo,
        o.nombre_comprador,
        CASE 
          WHEN uo.tipo = 'comprador_beneficiario' THEN 'Compra propia'
          WHEN uo.tipo = 'beneficiario' THEN CONCAT('Recibida de ', o.nombre_comprador)
          ELSE 'N/A'
        END as origen
      FROM user_orders uo
      JOIN gift_cards gc ON uo.gift_card_codes = gc.codigo
      JOIN orders o ON uo.order_id = o.id
      WHERE uo.user_id = ? AND uo.gift_card_codes IS NOT NULL AND gc.activa = 1
      ORDER BY gc.fecha_expiracion DESC
    `, [userId]);

    giftCards.forEach((card, index) => {
      console.log(`  ${index + 1}. ${card.codigo}`);
      console.log(`     - Valor: $${card.valor_inicial.toLocaleString()}`);
      console.log(`     - Saldo: $${card.saldo_actual.toLocaleString()}`);
      console.log(`     - Origen: ${card.origen}`);
      console.log(`     - Expira: ${card.fecha_expiracion.toISOString().split('T')[0]}`);
    });

    console.log('\n🎯 RESULTADO FINAL:');
    console.log(`   Historial de compras: ${historial.length} registro(s)`);
    console.log(`   Gift cards disponibles: ${giftCards.length} tarjeta(s)`);
    
    if (historial.length > 0 && giftCards.length > 0 && historial[0].tipo === 'comprador_beneficiario') {
      console.log('   🎉 ¡PERFECTO! Tienes tanto el historial como la gift card');
    } else {
      console.log('   ❌ Algo no está funcionando correctamente');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testAutoCompra();