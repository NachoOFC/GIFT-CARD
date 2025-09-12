const mysql = require('mysql2/promise');

// Configuración de la base de datos
const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'gift-card'
};

async function checkCompleteDatabase() {
  let connection;
  try {
    console.log('🔌 Conectando a la base de datos gift-card...');
    connection = await mysql.createConnection(config);
    
    // Verificar todas las tablas
    console.log('\n📋 Verificando tablas del sistema...');
    const [tables] = await connection.query('SHOW TABLES');
    
    const expectedTables = [
      'orders',
      'gift_cards', 
      'usuarios',
      'beneficiarios',
      'parametros',
      'user_orders',
      'audit_log',
      'notifications'
    ];
    
    console.log(`\n✅ Tablas encontradas (${tables.length}):`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      const isExpected = expectedTables.includes(tableName);
      console.log(`   ${isExpected ? '✅' : '❓'} ${tableName}`);
    });
    
    // Verificar estructura de usuarios
    console.log('\n👤 Estructura de tabla usuarios:');
    const [userColumns] = await connection.query('DESCRIBE usuarios');
    userColumns.forEach(col => {
      console.log(`   • ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar usuarios de prueba
    console.log('\n👥 Usuarios de prueba:');
    const [users] = await connection.query('SELECT id, nombre, usuario, gmail, perfil, telefono, fecha_registro FROM usuarios');
    users.forEach(user => {
      console.log(`   ${user.perfil === 'admin' ? '👑' : '👤'} ${user.nombre} (@${user.usuario}) - ${user.gmail || 'sin email'}`);
    });
    
    // Verificar gift cards de ejemplo
    console.log('\n🎁 Gift Cards de ejemplo:');
    const [giftCards] = await connection.query('SELECT COUNT(*) as total FROM gift_cards');
    console.log(`   📊 Total: ${giftCards[0].total} gift cards`);
    
    // Verificar órdenes
    console.log('\n📦 Órdenes de ejemplo:');
    const [orders] = await connection.query('SELECT COUNT(*) as total FROM orders');
    console.log(`   📊 Total: ${orders[0].total} órdenes`);
    
    // Verificar relaciones
    console.log('\n🔗 Verificando relaciones:');
    const [userOrdersCount] = await connection.query('SELECT COUNT(*) as total FROM user_orders');
    console.log(`   👤📦 User Orders: ${userOrdersCount[0].total} registros`);
    
    const [notificationsCount] = await connection.query('SELECT COUNT(*) as total FROM notifications');
    console.log(`   🔔 Notificaciones: ${notificationsCount[0].total} registros`);
    
    console.log('\n🎉 ¡Base de datos completamente configurada y lista para usar!');
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Ejecutar: npm run dev');
    console.log('   2. Ir a: http://localhost:3000');
    console.log('   3. Login con: admin / 123456');
    console.log('   4. Probar el sistema de perfil avanzado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkCompleteDatabase();