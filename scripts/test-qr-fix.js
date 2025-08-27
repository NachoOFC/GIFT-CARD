const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gift-card',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
      queueLimit: 0
    });

    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar estructura de la tabla orders
    const [rows] = await connection.execute('DESCRIBE orders');
    console.log('📋 Estructura de la tabla orders:');
    rows.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : ''} ${row.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
    // Verificar datos existentes
    const [orders] = await connection.execute('SELECT * FROM orders LIMIT 3');
    console.log('📊 Órdenes existentes (primeras 3):');
    orders.forEach(order => {
      console.log(`  - ID: ${order.id}, Orden: ${order.numero_orden}, Total: $${order.total}, Estado: ${order.estado}`);
    });
    
    connection.release();
    await pool.end();
    
    console.log('✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testDatabaseConnection();
