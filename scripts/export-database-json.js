const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function exportDatabaseToJSON() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🔄 EXPORTANDO BASE DE DATOS A JSON PARA COMPARTIR');
    console.log('='.repeat(50));

    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {}
    };

    // Tablas a exportar en orden (para evitar problemas de FK)
    const tablesToExport = [
      'usuarios',
      'beneficiarios', 
      'orders',
      'gift_cards',
      'user_orders',
      'audit_log',
      'notifications',
      'parametros'
    ];

    for (const table of tablesToExport) {
      try {
        console.log(`📋 Exportando tabla: ${table}`);
        
        // Obtener estructura
        const [structure] = await connection.query(`DESCRIBE ${table}`);
        
        // Obtener datos
        const [rows] = await connection.query(`SELECT * FROM ${table}`);
        
        exportData.tables[table] = {
          structure: structure,
          data: rows,
          count: rows.length
        };

        console.log(`   ✅ ${rows.length} registros exportados`);
      } catch (error) {
        console.log(`   ⚠️ Error exportando ${table}: ${error.message}`);
        exportData.tables[table] = { error: error.message };
      }
    }

    // Guardar archivo JSON
    const filename = `database_export_${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n✅ Base de datos exportada a: ${filename}`);
    console.log(`📤 Comparte este archivo con tus compañeros`);
    
    // Resumen
    console.log('\n📊 RESUMEN:');
    Object.keys(exportData.tables).forEach(table => {
      const tableData = exportData.tables[table];
      if (tableData.count !== undefined) {
        console.log(`   ${table}: ${tableData.count} registros`);
      } else {
        console.log(`   ${table}: ERROR`);
      }
    });

    console.log('\n📋 INSTRUCCIONES PARA TUS COMPAÑEROS:');
    console.log('1. Recibir el archivo JSON');
    console.log('2. Ejecutar: node scripts/import-database-json.js');
    console.log('3. Reiniciar la aplicación');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

exportDatabaseToJSON();