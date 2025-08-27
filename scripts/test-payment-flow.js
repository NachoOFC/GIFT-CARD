require('dotenv').config({ path: './.env.local' });
const mysql = require('mysql2/promise');
const QRCode = require('qrcode');

async function testPaymentFlow() {
  console.log('🧪 Probando flujo completo de pago (simulación directa)...\n');

  // Simular una compra
  const testOrder = {
    order_id: `TEST-ORDER-${Date.now()}`,
    monto: 25000,
    email_destinatario: 'moonsystemspv@gmail.com',
    customer_name: 'Cliente de Prueba',
  };

  console.log('📦 Datos de prueba:');
  console.log(JSON.stringify(testOrder, null, 2));
  console.log('');

  try {
    // Crear conexión a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gift-card',
    });

    // Generar código único para la gift card
    const codigo = `GC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    console.log('🎁 Creando gift card...');
    
    // Crear la gift card
    const insertGiftCard = await connection.execute(`
      INSERT INTO gift_cards (
        codigo,
        valor_inicial,
        saldo_actual,
        activa,
        fecha_creacion,
        fecha_expiracion,
        email_destinatario
      ) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), ?)
    `, [
      codigo,
      testOrder.monto,
      testOrder.monto,
      1,
      testOrder.email_destinatario
    ]);

    const giftCardId = insertGiftCard[0].insertId;
    console.log(`✅ Gift Card creada con ID: ${giftCardId}, código: ${codigo}`);

    // Crear la orden
    console.log('� Creando orden...');
    const orderResult = await connection.execute(`
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
      giftCardId
    ]);

    const orderId = orderResult[0].insertId;
    console.log(`✅ Orden creada con ID: ${orderId}`);

    // Generar QR code
    console.log('🔲 Generando código QR...');
    const activationUrl = `http://localhost:3000/activate/${codigo}`;
    const qrData = JSON.stringify({
      giftCardId: giftCardId,
      codigo: codigo,
      monto: testOrder.monto,
      activationUrl: activationUrl
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✅ Código QR generado');

    // Mostrar resumen
    console.log('\n📋 RESUMEN DE LA PRUEBA:');
    console.log(`  🎁 Gift Card ID: ${giftCardId}`);
    console.log(`  💳 Código: ${codigo}`);
    console.log(`  💰 Valor: $${testOrder.monto.toLocaleString()}`);
    console.log(`  📧 Email destinatario: ${testOrder.email_destinatario}`);
    console.log(`  📄 Orden ID: ${orderId}`);
    console.log(`  🔗 URL activación: ${activationUrl}`);
    console.log(`  🔲 QR generado: ${qrCodeDataURL.length > 0 ? '✅ SÍ' : '❌ NO'}`);

    await connection.end();

    console.log('\n✅ ¡Prueba completada exitosamente!');
    console.log('\n💡 Próximos pasos:');
    console.log('  1. Configura Gmail en .env.local con GMAIL_APP_PASSWORD');
    console.log('  2. Prueba el carrito en http://localhost:3000/cart');
    console.log('  3. Usa el formulario para hacer una compra real');

  } catch (error) {
    console.log('❌ Error en la prueba:');
    console.log(`  ${error.message}`);
  }
}

testPaymentFlow();
