require('dotenv').config({ path: './.env.local' });
const mysql = require('mysql2/promise');

async function checkOrdersTable() {
  console.log('🔍 Verificando tabla orders...\n');

  try {
    // Crear conexión
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gift-card',
    });

    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar si la tabla orders existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'orders'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Tabla orders encontrada');
      
      // Contar registros
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM orders'
      );
      console.log(`📊 Total de órdenes: ${countResult[0].total}`);

      // Verificar estructura de la tabla
      const [columns] = await connection.execute('DESCRIBE orders');
      console.log('\n📋 Estructura de la tabla orders:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
      });

      // Mostrar algunos registros de ejemplo
      const [sample] = await connection.execute('SELECT * FROM orders LIMIT 3');
      console.log('\n📄 Registros de ejemplo:');
      sample.forEach((order, index) => {
        console.log(`  ${index + 1}. ID: ${order.id} | Orden: ${order.numero_orden} | Email: ${order.email_comprador} | Total: ${order.total} | Estado: ${order.estado}`);
      });

    } else {
      console.log('❌ Tabla orders no encontrada');
      console.log('\n🛠️  Creando tabla orders...');
      
      await connection.execute(`
        CREATE TABLE orders (
          id int(11) NOT NULL AUTO_INCREMENT,
          numero_orden varchar(100) NOT NULL,
          email_comprador varchar(255) NOT NULL,
          total int(11) NOT NULL,
          estado varchar(50) DEFAULT 'pendiente',
          fecha_orden timestamp DEFAULT CURRENT_TIMESTAMP,
          gift_card_id int(11) DEFAULT NULL,
          PRIMARY KEY (id),
          KEY fk_orders_giftcard (gift_card_id),
          CONSTRAINT fk_orders_giftcard FOREIGN KEY (gift_card_id) REFERENCES gift_cards (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      
      console.log('✅ Tabla orders creada exitosamente');
    }

    await connection.end();
    console.log('\n🏁 Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOrdersTable();
