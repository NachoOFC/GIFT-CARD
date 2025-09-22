const mysql = require('mysql2/promise');

async function fixLogic() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost', 
      user: 'root', 
      password: '', 
      database: 'gift-card'
    });
    
    console.log('🔧 CORRIGIENDO LÓGICA DE COMPRA...\n');
    
    // Ver estado actual
    const [current] = await conn.execute(`
      SELECT uo.id, uo.tipo, uo.gift_card_codes, uo.total_amount,
             u.gmail as comprador_email,
             gc.email_destinatario
      FROM user_orders uo
      JOIN usuarios u ON uo.user_id = u.id
      LEFT JOIN gift_cards gc ON gc.codigo = uo.gift_card_codes
      WHERE uo.id = 23
    `);
    
    if (current.length === 0) {
      console.log('❌ No se encontró la compra');
      return;
    }
    
    const order = current[0];
    console.log('📋 Estado actual:');
    console.log(`• Tu email (comprador): ${order.comprador_email}`);
    console.log(`• Email destinatario: ${order.email_destinatario}`);
    console.log(`• Tipo actual: ${order.tipo}`);
    console.log(`• Tienes gift card: ${order.gift_card_codes ? 'SÍ' : 'NO'}`);
    
    const isAutoCompra = order.comprador_email === order.email_destinatario;
    console.log(`• ¿Es autocompra?: ${isAutoCompra ? 'SÍ' : 'NO'}\n`);
    
    if (!isAutoCompra && order.gift_card_codes) {
      console.log('🚨 PROBLEMA: Compraste para OTRA PERSONA pero tienes la gift card');
      console.log('🔧 Corrigiendo...\n');
      
      // Cambiar a solo comprador (quitar gift card)
      await conn.execute(`
        UPDATE user_orders 
        SET gift_card_codes = NULL, tipo = 'comprador'
        WHERE id = 23
      `);
      
      console.log('✅ CORREGIDO:');
      console.log('  • Tu registro: Solo historial de compra (sin gift card)');
      console.log(`  • La gift card quedó para: ${order.email_destinatario}`);
      
    } else if (isAutoCompra) {
      console.log('✅ CORRECTO: Es autocompra, está bien que tengas la gift card');
    } else {
      console.log('✅ CORRECTO: Ya no tienes la gift card');
    }
    
    // Verificar resultado final
    console.log('\n📊 RESULTADO FINAL:');
    const [final] = await conn.execute(`
      SELECT tipo, gift_card_codes, total_amount
      FROM user_orders WHERE id = 23
    `);
    
    const result = final[0];
    console.log(`• Tipo: ${result.tipo}`);
    console.log(`• Gift card: ${result.gift_card_codes || 'NO (correcto para compra ajena)'}`);
    console.log(`• Historial compra: $${result.total_amount.toLocaleString()}`);
    
    console.log('\n🎉 ¡PERFECTO! Ahora la lógica está correcta');
    
    await conn.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixLogic();