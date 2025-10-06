const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'gift-card',
      waitForConnections: true,
      connectionLimit: 10
    });

    console.log('📊 Conectando a la base de datos...');
    
    const sql = fs.readFileSync('./migrations/20251006_add_redes_sociales.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log('✅ Ejecutado:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Columna ya existe, omitiendo...');
          } else {
            throw err;
          }
        }
      }
    }

    console.log('\n✅ Migración completada exitosamente');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
