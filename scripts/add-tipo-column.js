const mysql = require('mysql2/promise');

// Config mirrored from src/utils/db.ts
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card'
};

async function checkAndAddTipoColumn() {
  const connection = await mysql.createConnection(config);
  
  try {
    // Verificar si la columna 'tipo' existe
    const [columns] = await connection.query('DESCRIBE user_orders');
    const hasType = columns.some(col => col.Field === 'tipo');
    
    if (!hasType) {
      console.log('🔧 Agregando columna tipo a user_orders...');
      await connection.query('ALTER TABLE user_orders ADD COLUMN tipo VARCHAR(50) DEFAULT NULL');
      console.log('✅ Columna tipo agregada correctamente');
    } else {
      console.log('✅ La columna tipo ya existe en user_orders');
    }
    
    // Mostrar estructura actualizada
    const [newStructure] = await connection.query('DESCRIBE user_orders');
    console.log('📋 Estructura de user_orders:');
    newStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAndAddTipoColumn();