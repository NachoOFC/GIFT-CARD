const mysql = require('mysql2/promise');

// Config mirrored from src/utils/db.ts
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function checkDatabase() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('✅ Conectado a la base de datos:', config.database);
    
    // Verificar si la tabla usuarios existe
    const [tables] = await conn.query("SHOW TABLES LIKE 'usuarios'");
    if (tables.length === 0) {
      console.log('❌ La tabla usuarios NO existe');
      return;
    }
    console.log('✅ La tabla usuarios existe');
    
    // Verificar estructura de la tabla usuarios
    const [columns] = await conn.query('DESCRIBE usuarios');
    console.log('\n📋 Estructura de la tabla usuarios:');
    console.table(columns);
    
    // Verificar si hay datos en la tabla
    const [count] = await conn.query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`\n📊 Total de usuarios registrados: ${count[0].total}`);
    
    // Mostrar algunos usuarios si existen
    if (count[0].total > 0) {
      const [users] = await conn.query('SELECT id, nombre, usuario, gmail, perfil, estado FROM usuarios LIMIT 5');
      console.log('\n👥 Usuarios existentes:');
      console.table(users);
    }
    
  } catch (err) {
    console.error('❌ Error al verificar la base de datos:', err.message || err);
    console.error('Detalles del error:', err);
  } finally {
    if (conn) await conn.end();
  }
}

checkDatabase();
