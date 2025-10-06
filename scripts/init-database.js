const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 Conectando a MariaDB...');
    
    // Conectar SIN especificar base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    console.log('✅ Conexión exitosa a MariaDB');
    
    // Leer el archivo SQL
    console.log('📖 Leyendo archivo gift-card.sql...');
    const sqlPath = path.join(__dirname, '..', 'gift-card.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    console.log('🚀 Ejecutando SQL...');
    console.log('   - Creando base de datos gift-card');
    
    // Primero crear la base de datos
    await connection.query('CREATE DATABASE IF NOT EXISTS `gift-card` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci');
    await connection.query('USE `gift-card`');
    
    console.log('   - Creando tablas...');
    console.log('   - Insertando datos de ejemplo...');
    
    // Ejecutar el SQL completo
    await connection.query(sqlContent);
    
    console.log('');
    console.log('✅ ¡Base de datos creada exitosamente!');
    console.log('');
    console.log('📋 Tablas creadas:');
    console.log('   ✓ empresas');
    console.log('   ✓ orders');
    console.log('   ✓ gift_cards');
    console.log('   ✓ usuarios');
    console.log('   ✓ beneficiarios');
    console.log('   ✓ parametros');
    console.log('   ✓ user_orders');
    console.log('   ✓ audit_log');
    console.log('   ✓ notifications');
    console.log('   ✓ gift_card_transactions');
    console.log('');
    console.log('👥 Usuarios de prueba creados:');
    console.log('   📧 admin@giftcard.com / 123456 (admin)');
    console.log('   📧 demo@giftcard.com / demo123 (user)');
    console.log('   📧 lucas@gmail.com / 123456 (admin)');
    console.log('');
    console.log('🎯 Siguiente paso: npm run dev');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:');
    console.error(error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('⚠️  Verifica las credenciales en .env.local:');
      console.log('   DB_USER=root');
      console.log('   DB_PASSWORD=tu_contraseña');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('⚠️  MariaDB no está ejecutándose. Inicia el servidor:');
      console.log('   - Abre XAMPP Control Panel');
      console.log('   - Haz clic en "Start" para MySQL/MariaDB');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar
initDatabase();
