const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function main() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('📋 Revisando user_orders...\n');
        
        // Revisar estructura de user_orders
        console.log('📋 Estructura de la tabla user_orders:');
        const [columns] = await connection.execute('DESCRIBE user_orders');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} (${col.Null})`);
        });
        
        console.log('\n📊 Registros en user_orders:');
        const [userOrders] = await connection.execute(`
            SELECT * FROM user_orders 
            ORDER BY id DESC 
            LIMIT 10
        `);
        
        if (userOrders.length === 0) {
            console.log('❌ No hay registros en user_orders');
        } else {
            console.table(userOrders);
        }
        
        console.log('\n🔍 Comparando con orders recientes:');
        const [orders] = await connection.execute(`
            SELECT 
                numero_orden,
                email_comprador,
                total,
                estado,
                fecha_orden
            FROM orders 
            ORDER BY fecha_orden DESC 
            LIMIT 5
        `);
        
        console.table(orders);
        
        // Verificar si hay desconexión entre orders y user_orders
        console.log('\n🔍 Órdenes que NO están en user_orders:');
        const [missing] = await connection.execute(`
            SELECT 
                o.numero_orden,
                o.email_comprador,
                o.total,
                o.estado
            FROM orders o
            LEFT JOIN user_orders uo ON o.numero_orden = uo.numero_orden
            WHERE uo.numero_orden IS NULL
            ORDER BY o.fecha_orden DESC
            LIMIT 5
        `);
        
        if (missing.length === 0) {
            console.log('✅ Todas las órdenes están registradas en user_orders');
        } else {
            console.table(missing);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

main();