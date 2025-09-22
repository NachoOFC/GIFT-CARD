const { Client } = require('pg');

async function createAdminUser() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gift_cards',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    await client.connect();
    
    // Crear tabla de usuarios si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL,
        estado BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verificar si el usuario admin ya existe
    const checkAdmin = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@sistema.cl']
    );

    if (checkAdmin.rows.length === 0) {
      // Crear usuario administrador si no existe
      await client.query(`
        INSERT INTO users (nombre, email, password, rol, estado)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'Administrador del sistema',
        'admin@sistema.cl',
        'Admin1234!',
        'ADMIN',
        true
      ]);
      console.log('Usuario administrador creado correctamente');
    } else {
      console.log('El usuario administrador ya existe');
    }

    // Verificar que se creó correctamente
    const verify = await client.query('SELECT * FROM users WHERE rol = $1', ['ADMIN']);
    console.log('Usuarios administradores encontrados:', verify.rows.length);
    console.log('Detalles:', verify.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Proceso completado');
  }
}

createAdminUser();