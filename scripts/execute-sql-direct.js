const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'gift-card'
};

async function executeSQL() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    console.log('🔌 Conectado a la base de datos');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'gift-card.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar directamente con multipleStatements
    const configWithMultiple = {
      ...config,
      multipleStatements: true
    };
    
    const connMultiple = await mysql.createConnection(configWithMultiple);
    
    console.log('📊 Ejecutando SQL completo...');
    await connMultiple.query(sqlContent);
    
    console.log('✅ SQL ejecutado exitosamente');
    
    await connMultiple.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executeSQL();