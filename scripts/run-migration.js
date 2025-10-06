const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Conectando a MariaDB...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gift-card'
    });
    
    console.log('✅ Conexión exitosa');
    console.log('📝 Ejecutando migración: add_portada_empresas.sql');
    
    // Leer el archivo de migración
    const sqlPath = path.join(__dirname, '..', 'migrations', '20251006_add_portada_empresas.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    // Ejecutar SQL
    await connection.query(sqlContent);
    
    console.log('');
    console.log('✅ Migración completada exitosamente!');
    console.log('');
    console.log('📋 Cambios aplicados:');
    console.log('   ✓ Añadida columna portada_url a tabla empresas');
    console.log('');
    
    // Verificar estructura
    const [columns] = await connection.query('DESCRIBE empresas');
    const portadaColumn = columns.find(col => col.Field === 'portada_url');
    
    if (portadaColumn) {
      console.log('✓ Verificación exitosa:');
      console.log(`   Columna: ${portadaColumn.Field}`);
      console.log(`   Tipo: ${portadaColumn.Type}`);
      console.log(`   Nulo: ${portadaColumn.Null}`);
      console.log(`   Default: ${portadaColumn.Default}`);
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:');
    console.error(error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('');
      console.log('⚠️  La columna portada_url ya existe. Migración omitida.');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
