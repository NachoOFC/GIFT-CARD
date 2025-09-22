const mysql = require('mysql2/promise');

async function fixBeneficiaryGiftCard() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost', 
      user: 'root', 
      password: '', 
      database: 'gift-card'
    });
    
    console.log('🔧 ASIGNANDO GIFT CARD AL BENEFICIARIO...\n');
    
    const beneficiaryEmail = 'alexanderviveros20612@gmail.com';
    const giftCardCode = 'GC-ORDER-1758562720594-1167'; // Tu compra
    
    // 1. Verificar beneficiario
    const [user] = await conn.execute(`
      SELECT id FROM usuarios WHERE gmail = ?
    `, [beneficiaryEmail]);
    
    if (user.length === 0) {
      console.log('❌ Beneficiario no tiene cuenta');
      return;
    }
    
    const beneficiaryId = user[0].id;
    console.log(`👤 Beneficiario ID: ${beneficiaryId} (${beneficiaryEmail})`);
    
    // 2. Verificar gift card
    const [giftCard] = await conn.execute(`
      SELECT codigo, valor_inicial, order_id 
      FROM gift_cards 
      WHERE codigo = ?
    `, [giftCardCode]);
    
    if (giftCard.length === 0) {
      console.log('❌ Gift card no encontrada');
      return;
    }
    
    const gc = giftCard[0];
    console.log(`🎁 Gift card: ${gc.codigo} - $${gc.valor_inicial.toLocaleString()}`);
    
    // 3. Verificar si ya tiene registro
    const [existing] = await conn.execute(`
      SELECT id FROM user_orders 
      WHERE user_id = ? AND gift_card_codes = ?
    `, [beneficiaryId, giftCardCode]);
    
    if (existing.length > 0) {
      console.log('✅ Ya tiene registro - debería verla');
    } else {
      console.log('🚨 NO tiene registro - creando...');
      
      // Crear registro para el beneficiario
      await conn.execute(`
        INSERT INTO user_orders 
        (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo)
        VALUES (?, ?, ?, 0, NOW(), 'active', 'beneficiario')
      `, [beneficiaryId, gc.order_id, giftCardCode]);
      
      console.log('✅ Registro creado para beneficiario');
    }
    
    // 4. Verificar resultado
    console.log('\n📊 VERIFICACIÓN FINAL:');
    const [finalCheck] = await conn.execute(`
      SELECT uo.tipo, uo.gift_card_codes, uo.total_amount, u.gmail
      FROM user_orders uo
      JOIN usuarios u ON uo.user_id = u.id
      WHERE uo.gift_card_codes = ?
      ORDER BY uo.tipo
    `, [giftCardCode]);
    
    console.table(finalCheck);
    
    console.log('\n🎉 RESULTADO:');
    console.log('✅ Comprador: Solo historial de gasto');
    console.log('✅ Beneficiario: Puede usar la gift card');
    
    await conn.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixBeneficiaryGiftCard();