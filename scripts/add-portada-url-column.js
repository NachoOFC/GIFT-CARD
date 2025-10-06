// Script para agregar columna portada_url a tabla empresas
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addPortadaColumn() {
  let connection;
  
  try {
    // Crear conexión
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gift-card'
    });

    console.log('✅ Conectado a la base de datos');

    // Verificar si la columna ya existe
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'empresas' 
      AND COLUMN_NAME = 'portada_url'
    `, [process.env.DB_NAME || 'gift-card']);

    if (columns.length > 0) {
      console.log('⚠️  La columna portada_url ya existe en la tabla empresas');
      return;
    }

    // Agregar la columna
    await connection.query(`
      ALTER TABLE \`empresas\` 
      ADD COLUMN \`portada_url\` VARCHAR(500) DEFAULT NULL 
      COMMENT 'URL de la imagen de portada de la empresa' 
      AFTER \`logo_url\`
    `);

    console.log('✅ Columna portada_url agregada exitosamente!');

    // Verificar la estructura actualizada
    const [structure] = await connection.query('DESCRIBE empresas');
    console.log('\n📋 Estructura de tabla empresas:');
    console.table(structure);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

// Ejecutar
addPortadaColumn()
  .then(() => {
    console.log('\n🎉 Migración completada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
