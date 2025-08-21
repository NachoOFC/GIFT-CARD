const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Config mirrored from src/utils/db.ts
const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: ''
};

async function main() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('No se encontró', schemaPath);
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Conectado al servidor MySQL. Creando base de datos...');
    await conn.query("CREATE DATABASE IF NOT EXISTS `gift-card` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await conn.changeUser({ database: 'gift-card' });
    console.log('Ejecutando esquema...');
    await conn.query(schema);
    console.log('Inicialización completada.');
    process.exit(0);
  } catch (err) {
    console.error('Error al inicializar la BD:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
