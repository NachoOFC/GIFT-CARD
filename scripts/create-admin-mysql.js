const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gift-card'
  });

  try {
    // Verificar si el usuario admin ya existe
    const [adminUsers] = await connection.execute(
      'SELECT * FROM usuarios WHERE gmail = ? OR usuario = ?',
      ['admin@sistema.cl', 'admin_sistema']
    );

    if (adminUsers.length === 0) {
      // Crear nuevo usuario administrador
      await connection.execute(`
        INSERT INTO usuarios (
          nombre, usuario, gmail, telefono,
          password, perfil, estado
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?
        )
      `, [
        'Administrador del sistema',
        'admin_sistema',
        'admin@sistema.cl',
        '+56912345678',
        'Admin1234!',
        'admin',
        1
      ]);
      console.log('Usuario administrador creado correctamente');
    } else {
      console.log('El usuario administrador ya existe');
    }

    // Verificar la creación
    const [users] = await connection.execute('SELECT * FROM usuarios WHERE perfil = ?', ['admin']);
    console.log('Usuarios administradores encontrados:', users.length);
    console.log('Detalles:', users);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('Proceso completado');
  }
}

// Instalar dependencias necesarias
createAdminUser();