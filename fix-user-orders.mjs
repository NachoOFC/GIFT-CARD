import pool from './src/utils/db.ts';

async function checkAndFixUserOrders() {
  try {
    console.log('🔍 Verificando datos en user_orders...\n');
    
    const connection = await pool.getConnection();
    
    // Obtener registros problemáticos (usuarios como compradores que probablemente son beneficiarios)
    const [problematicOrders] = await connection.execute(`
      SELECT 
        uo.id,
        uo.user_id,
        uo.order_id,
        uo.gift_card_codes,
        uo.total_amount,
        uo.tipo,
        o.email_comprador,
        gc.email_destinatario,
        u.gmail as user_email
      FROM user_orders uo
      LEFT JOIN orders o ON uo.order_id = o.id
      LEFT JOIN gift_cards gc ON gc.codigo = uo.gift_card_codes
      LEFT JOIN usuarios u ON u.id = uo.user_id
      WHERE uo.tipo = 'comprador'
      ORDER BY uo.id DESC
      LIMIT 10
    `);
    
    console.log('📋 Registros de compradores:');
    problematicOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. User ID: ${order.user_id} | Email: ${order.user_email}`);
      console.log(`     Comprador en orden: ${order.email_comprador}`);
      console.log(`     Destinatario GC: ${order.email_destinatario}`);
      console.log(`     Tipo: ${order.tipo} | Monto: ${order.total_amount}`);
      console.log(`     Gift Card: ${order.gift_card_codes}`);
      
      // Verificar si es correcto
      if (order.user_email === order.email_comprador && order.user_email !== order.email_destinatario) {
        console.log(`     ✅ CORRECTO: Es comprador real`);
      } else if (order.user_email === order.email_destinatario && order.user_email !== order.email_comprador) {
        console.log(`     ❌ INCORRECTO: Debería ser beneficiario`);
      } else if (order.user_email === order.email_comprador && order.user_email === order.email_destinatario) {
        console.log(`     ⚠️ CAMBIAR: Debería ser comprador_beneficiario`);
      }
      console.log('');
    });
    
    connection.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAndFixUserOrders();