const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Configuración de la base de datos
const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '' // Cambia esto si tu MySQL tiene contraseña
};

async function applyCompleteSQL() {
  const sqlPath = path.join(__dirname, '..', 'gift-card.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ No se encontró el archivo gift-card.sql');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  let connection;
  try {
    console.log('🔌 Conectando al servidor MySQL...');
    connection = await mysql.createConnection(config);
    
    console.log('🗑️  Eliminando base de datos existente (si existe)...');
    await connection.query('DROP DATABASE IF EXISTS `gift-card`');
    
    console.log('🆕 Creando nueva base de datos...');
    await connection.query('CREATE DATABASE `gift-card` CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci');
    
    console.log('🔄 Cambiando a la nueva base de datos...');
    await connection.changeUser({ database: 'gift-card' });
    
    console.log('📊 Aplicando estructura completa...');
    
    // Dividir el SQL en comandos individuales
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*!'));
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command && command.length > 10) {
        try {
          await connection.query(command);
          if (command.toLowerCase().includes('create table')) {
            console.log(`  ✅ Tabla creada: ${command.match(/CREATE TABLE[^`]*`([^`]+)`/i)?.[1] || 'desconocida'}`);
          }
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn(`  ⚠️  Comando falló: ${error.message}`);
          }
        }
      }
    }
    
    console.log('\n🎉 ¡Base de datos completamente configurada!');
    console.log('\n📋 Resumen de la configuración:');
    console.log('   • Sistema de usuarios con perfil avanzado');
    console.log('   • Gestión completa de gift cards');
    console.log('   • Sistema de órdenes corporativas');
    console.log('   • Auditoría y notificaciones');
    console.log('   • Usuarios de prueba incluidos');
    console.log('\n👥 Usuarios de prueba:');
    console.log('   • admin / 123456 (administrador)');
    console.log('   • demo / demo123 (usuario)');
    console.log('   • lucas / 123456 (administrador)');
    console.log('\n🚀 Listo para usar con: npm run dev');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyCompleteSQL();