const axios = require('axios');

async function testOptimizedUserCreation() {
  console.log('🧪 TESTING SISTEMA OPTIMIZADO DE USUARIOS');
  console.log('==========================================');
  
  try {
    // Prueba 1: Usuario se compra a sí mismo (debería ser comprador_beneficiario)
    console.log('\n📝 PRUEBA 1: Autocompra (comprador = beneficiario)');
    const autocompra = await axios.post('http://localhost:3000/api/giftcard/generate', {
      order_id: 'AUTOCOMPRA_' + Date.now(),
      monto: 15000,
      email_destinatario: 'alexanderviveros20612@gmail.com',
      customer_name: 'Alexander Viveros',
      empresa: 'Test'
    });
    
    console.log('✅ Autocompra resultado:', autocompra.data.success);
    
    // Prueba 2: Compra a usuario existente (no debería crear nuevo usuario)
    console.log('\n📝 PRUEBA 2: Compra a usuario existente');
    const compraExistente = await axios.post('http://localhost:3000/api/giftcard/generate', {
      order_id: 'EXISTING_' + Date.now(),
      monto: 20000,
      email_destinatario: 'alexanderviveros9@gmail.com', // Usuario que ya existe
      customer_name: 'Alexander Comprador',
      beneficiary_name: 'Alexander Beneficiario Existente',
      empresa: 'Test'
    });
    
    console.log('✅ Compra a existente resultado:', compraExistente.data.success);
    
    // Prueba 3: Compra a usuario nuevo (debería crear usuario con contraseña temporal)
    console.log('\n📝 PRUEBA 3: Compra a usuario completamente nuevo');
    const compraNuevo = await axios.post('http://localhost:3000/api/giftcard/generate', {
      order_id: 'NEWUSER_' + Date.now(),
      monto: 25000,
      email_destinatario: `testuser${Date.now()}@test.com`,
      customer_name: 'Comprador Test',
      beneficiary_name: 'Usuario Completamente Nuevo',
      empresa: 'Test'
    });
    
    console.log('✅ Compra a nuevo resultado:', compraNuevo.data.success);
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error.response?.data || error.message);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  testOptimizedUserCreation();
}

module.exports = testOptimizedUserCreation;