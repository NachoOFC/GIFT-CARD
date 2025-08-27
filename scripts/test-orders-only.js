require('dotenv').config({ path: './.env.local' });
const mysql = require('mysql2/promise');

async function testNewPurchaseFlow() {
  console.log('🧪 Probando nuevo flujo: SOLO ÓRDENES (no gift cards)\n');

  try {
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gift-card',
    });

    // Contar gift cards y órdenes ANTES
    const [giftCardsBefore] = await connection.execute('SELECT COUNT(*) as total FROM gift_cards');
    const [ordersBefore] = await connection.execute('SELECT COUNT(*) as total FROM orders');
    
    console.log('📊 ANTES de la compra:');
    console.log(`  🎁 Gift Cards: ${giftCardsBefore[0].total}`);
    console.log(`  📄 Órdenes: ${ordersBefore[0].total}`);
    console.log('');

    // Simular una compra directamente en la base de datos (como lo hace el API)
    const testOrder = {
      order_id: `TEST-${Date.now()}`,
      monto: 25000,
      email_destinatario: 'test@ejemplo.com',
      customer_name: 'Cliente Test'
    };

    console.log('🛒 Simulando compra...');
    console.log(`  📦 Orden: ${testOrder.order_id}`);
    console.log(`  💰 Monto: $${testOrder.monto.toLocaleString()}`);
    console.log(`  📧 Email: ${testOrder.email_destinatario}`);
    console.log('');

    // Solo crear orden (NO gift card)
    const [orderResult] = await connection.execute(`
      INSERT INTO orders (
        numero_orden,
        email_comprador,
        total,
        estado,
        fecha_orden,
        gift_card_id
      ) VALUES (?, ?, ?, ?, NOW(), ?)
    `, [
      testOrder.order_id,
      testOrder.email_destinatario,
      testOrder.monto,
      'pagado',
      null // No hay gift_card_id
    ]);

    console.log(`✅ Orden creada con ID: ${orderResult.insertId}`);

    // Contar gift cards y órdenes DESPUÉS
    const [giftCardsAfter] = await connection.execute('SELECT COUNT(*) as total FROM gift_cards');
    const [ordersAfter] = await connection.execute('SELECT COUNT(*) as total FROM orders');
    
    console.log('\n📊 DESPUÉS de la compra:');
    console.log(`  🎁 Gift Cards: ${giftCardsAfter[0].total} (cambio: +${giftCardsAfter[0].total - giftCardsBefore[0].total})`);
    console.log(`  📄 Órdenes: ${ordersAfter[0].total} (cambio: +${ordersAfter[0].total - ordersBefore[0].total})`);
    
    // Verificar resultado
    const giftCardChange = giftCardsAfter[0].total - giftCardsBefore[0].total;
    const orderChange = ordersAfter[0].total - ordersBefore[0].total;

    console.log('\n🎯 RESULTADO:');
    if (giftCardChange === 0 && orderChange === 1) {
      console.log('✅ ¡PERFECTO! Solo se creó la orden, no gift card');
      console.log('✅ El sistema funciona correctamente');
    } else if (giftCardChange > 0) {
      console.log('❌ ERROR: Se creó una gift card (no debería)');
    } else if (orderChange === 0) {
      console.log('❌ ERROR: No se creó la orden');
    }

    // Mostrar la última orden creada
    const [lastOrder] = await connection.execute(`
      SELECT * FROM orders WHERE id = ? LIMIT 1
    `, [orderResult.insertId]);

    if (lastOrder.length > 0) {
      const order = lastOrder[0];
      console.log('\n📄 Orden creada:');
      console.log(`  ID: ${order.id}`);
      console.log(`  Número: ${order.numero_orden}`);
      console.log(`  Email: ${order.email_comprador}`);
      console.log(`  Total: $${order.total.toLocaleString()}`);
      console.log(`  Estado: ${order.estado}`);
      console.log(`  Gift Card ID: ${order.gift_card_id || 'null (correcto)'}`);
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testNewPurchaseFlow();
