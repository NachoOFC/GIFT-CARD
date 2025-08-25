const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'gift-card'
    });

    console.log('✅ Conexión exitosa a la base de datos!');
    
    // Probar consulta
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM gift_cards');
    console.log(`📊 Total de gift cards en la BD: ${rows[0].total}`);
    
    // Mostrar estructura de la tabla
    const [columns] = await connection.execute('DESCRIBE gift_cards');
    console.log('📋 Estructura de la tabla gift_cards:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 El servidor de base de datos no está corriendo.');
      console.log('   Instala y inicia MariaDB/MySQL:');
      console.log('   - Descarga MariaDB desde: https://mariadb.org/download/');
      console.log('   - O instala XAMPP que incluye MySQL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Error de autenticación. Verifica usuario y contraseña.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 La base de datos "gift-card" no existe.');
      console.log('   Ejecuta el archivo gift-card.sql para crear la BD.');
    }
  }
}

testConnection();
