require('dotenv').config({ path: './.env.local' });
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('🔍 Probando conexión a la base de datos...\n');

  // Mostrar configuración (sin contraseña)
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '[HIDDEN]' : '[EMPTY]',
    database: process.env.DB_NAME || 'gift-card',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : undefined
  };

  console.log('📋 Configuración de conexión:');
  console.log(JSON.stringify(config, null, 2));
  console.log('');

  try {
    // Crear conexión
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gift-card',
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : undefined
    });

    console.log('✅ Conexión exitosa a la base de datos');

    // Probar consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', rows[0]);

    // Verificar si la tabla gift_cards existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'gift_cards'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Tabla gift_cards encontrada');
      
      // Contar registros
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM gift_cards'
      );
      console.log(`📊 Total de gift cards: ${countResult[0].total}`);
    } else {
      console.log('⚠️  Tabla gift_cards no encontrada');
    }

    // Verificar estructura de la tabla
    try {
      const [columns] = await connection.execute(
        'DESCRIBE gift_cards'
      );
      console.log('📋 Estructura de la tabla gift_cards:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (error) {
      console.log('❌ Error al verificar estructura de la tabla:', error.message);
    }

    await connection.end();
    console.log('\n🏁 Prueba de conexión completada exitosamente');

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    // Sugerencias de solución
    console.log('\n💡 Sugerencias para solucionar el problema:');
    console.log('1. Verifica que las variables de entorno estén configuradas:');
    console.log('   - DB_HOST');
    console.log('   - DB_PORT');
    console.log('   - DB_USER');
    console.log('   - DB_PASSWORD');
    console.log('   - DB_NAME');
    console.log('');
    console.log('2. Para desarrollo local, crea un archivo .env.local con:');
    console.log('   DB_HOST=127.0.0.1');
    console.log('   DB_PORT=3306');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=');
    console.log('   DB_NAME=gift-card');
    console.log('');
    console.log('3. Para producción, configura las variables de entorno en tu plataforma de despliegue');
  }
}

// Ejecutar la prueba
testDatabaseConnection();
