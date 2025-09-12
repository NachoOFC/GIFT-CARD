const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function testGiftCardLogic() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🧪 PROBANDO LÓGICA GIFT CARD: COMPRADOR vs BENEFICIARIO');
    console.log('='*60);

    // Test 1: Comprador != Beneficiario
    console.log('\n📤 TEST 1: API con comprador diferente al beneficiario');
    
    const response1 = await fetch('http://localhost:3000/api/giftcard/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: `ORDER-${Date.now()}-TEST1`,
        monto: 15000,
        email_destinatario: 'beneficiario@test.com',
        email_comprador: 'comprador@test.com',
        customer_name: 'Juan Comprador',
        beneficiary_name: 'María Beneficiaria'
      })
    });

    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ API Response:', result1.success ? 'SUCCESS' : 'FAILED');
      
      // Verificar base de datos
      const [beneficiaryOrders] = await connection.query(
        'SELECT * FROM user_orders WHERE user_id = (SELECT id FROM usuarios WHERE gmail = ?)',
        ['beneficiario@test.com']
      );
      
      const [buyerOrders] = await connection.query(
        'SELECT * FROM user_orders WHERE user_id = (SELECT id FROM usuarios WHERE gmail = ?)',
        ['comprador@test.com']
      );

      console.log(`📋 Beneficiario tiene: ${beneficiaryOrders.length} registros`);
      beneficiaryOrders.forEach(order => {
        console.log(`  - Tipo: ${order.tipo}, Gift Card: ${order.gift_card_codes ? 'SÍ' : 'NO'}`);
      });

      console.log(`📋 Comprador tiene: ${buyerOrders.length} registros`);
      buyerOrders.forEach(order => {
        console.log(`  - Tipo: ${order.tipo}, Gift Card: ${order.gift_card_codes ? 'SÍ' : 'NO'}`);
      });
    }

    console.log('\n' + '='*60);

    // Test 2: Comprador = Beneficiario  
    console.log('\n🔄 TEST 2: API con comprador = beneficiario');
    
    const response2 = await fetch('http://localhost:3000/api/giftcard/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: `ORDER-${Date.now()}-TEST2`,
        monto: 25000,
        email_destinatario: 'mismo@test.com',
        // No especificamos email_comprador, será igual a email_destinatario
        customer_name: 'Carlos Mismo',
        beneficiary_name: 'Carlos Mismo'
      })
    });

    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ API Response:', result2.success ? 'SUCCESS' : 'FAILED');
      
      // Verificar base de datos
      const [samePersonOrders] = await connection.query(
        'SELECT * FROM user_orders WHERE user_id = (SELECT id FROM usuarios WHERE gmail = ?)',
        ['mismo@test.com']
      );

      console.log(`📋 Usuario (comprador=beneficiario) tiene: ${samePersonOrders.length} registros`);
      samePersonOrders.forEach(order => {
        console.log(`  - Tipo: ${order.tipo}, Gift Card: ${order.gift_card_codes ? 'SÍ' : 'NO'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  } finally {
    await connection.end();
  }
}

testGiftCardLogic();