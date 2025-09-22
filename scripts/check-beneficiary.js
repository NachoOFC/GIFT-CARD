const mysql = require('mysql2/promise');

async function checkBeneficiary() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost', 
      user: 'root', 
      password: '', 
      database: 'gift-card'
    });
    
    console.log('🔍 VERIFICANDO BENEFICIARIO...\n');
    
    const beneficiaryEmail = 'alexanderviveros20612@gmail.com';
    
    // 1. Verificar si el beneficiario tiene cuenta
    const [user] = await conn.execute(`
      SELECT id, nombre, gmail 
      FROM usuarios 
      WHERE gmail = ?
    `, [beneficiaryEmail]);
    
    console.log('👤 BENEFICIARIO:');
    if (user.length > 0) {
      console.log(`✅ Tiene cuenta: ID ${user[0].id}, ${user[0].nombre || 'Sin nombre'}`);
      console.log(`   Email: ${user[0].gmail}`);
    } else {
      console.log('❌ NO tiene cuenta de usuario');
    }
    
    // 2. Verificar gift card creada
    const [giftCard] = await conn.execute(`
      SELECT codigo, email_destinatario, valor_inicial, activa, fecha_creacion
      FROM gift_cards 
      WHERE email_destinatario = ?
    `, [beneficiaryEmail]);
    
    console.log('\n🎁 GIFT CARD:');
    if (giftCard.length > 0) {
      const gc = giftCard[0];
      console.log(`✅ Gift card creada: ${gc.codigo}`);
      console.log(`   Valor: $${gc.valor_inicial.toLocaleString()}`);
      console.log(`   Activa: ${gc.activa ? 'SÍ' : 'NO'}`);
      console.log(`   Creada: ${gc.fecha_creacion.toLocaleString()}`);
    } else {
      console.log('❌ NO se encontró gift card para este email');
    }
    
    // 3. Verificar registro en user_orders
    if (user.length > 0) {
      const [userOrders] = await conn.execute(`
        SELECT id, gift_card_codes, total_amount, tipo, status
        FROM user_orders 
        WHERE user_id = ?
      `, [user[0].id]);
      
      console.log('\n📋 ÓRDENES DEL BENEFICIARIO:');
      if (userOrders.length > 0) {
        userOrders.forEach(order => {
          console.log(`• Orden ${order.id}: ${order.tipo}, $${order.total_amount}`);
          console.log(`  Gift card: ${order.gift_card_codes || 'NO'}`);
        });
      } else {
        console.log('❌ NO tiene órdenes registradas');
      }
    }
    
    // 4. DIAGNÓSTICO
    console.log('\n🚨 DIAGNÓSTICO:');
    if (user.length === 0) {
      console.log('❌ PROBLEMA: El beneficiario NO tiene cuenta');
      console.log('💡 SOLUCIÓN: Debe registrarse con alexanderviveros20612@gmail.com');
    } else if (giftCard.length === 0) {
      console.log('❌ PROBLEMA: No se creó gift card para este email');
    } else {
      // Verificar si tiene registro en user_orders
      const [hasOrder] = await conn.execute(`
        SELECT id FROM user_orders 
        WHERE user_id = ? AND gift_card_codes IS NOT NULL
      `, [user[0].id]);
      
      if (hasOrder.length === 0) {
        console.log('❌ PROBLEMA: Tiene gift card pero no registro en user_orders');
        console.log('💡 NECESITA: Crear registro para que vea la gift card');
      } else {
        console.log('✅ Todo correcto - debería ver la gift card');
      }
    }
    
    await conn.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBeneficiary();