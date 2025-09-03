const mysql = require('mysql2/promise');

// Config mirrored from src/utils/db.ts
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function checkUser() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('✅ Conectado a la base de datos');
    
    // Buscar el usuario específico
    const email = 'marcosnehemias19@gmail.com';
    const [users] = await conn.query('SELECT * FROM usuarios WHERE usuario = ?', [email]);
    
    if (users.length > 0) {
      console.log('👤 Usuario encontrado:');
      console.table(users);
      console.log('🔑 Password almacenado:', users[0].password);
    } else {
      console.log('❌ Usuario no encontrado');
      
      // Mostrar todos los usuarios para debug
      const [allUsers] = await conn.query('SELECT id, nombre, usuario, gmail FROM usuarios');
      console.log('📋 Todos los usuarios:');
      console.table(allUsers);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message || err);
  } finally {
    if (conn) await conn.end();
  }
}

checkUser();
