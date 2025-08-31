const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gift-card',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkStructure() {
  try {
    console.log('📋 Estructura de la tabla orders:');
    const [structure] = await pool.execute('DESCRIBE orders');
    structure.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n📊 Últimas 3 órdenes:');
    const [orders] = await pool.execute(`
      SELECT numero_orden, total, estado, nombre_comprador, email_comprador, fecha_orden 
      FROM orders 
      ORDER BY id DESC 
      LIMIT 3
    `);
    
    orders.forEach(order => {
      console.log(`  - ${order.numero_orden}: $${order.total} - ${order.estado} - ${order.nombre_comprador || 'Sin nombre'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStructure();
