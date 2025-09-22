const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function checkRecentOrders() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 Verificando órdenes más recientes...\n');
        
        // Ver las últimas 5 órdenes
        console.log('📦 ÚLTIMAS 5 ÓRDENES:');
        const [orders] = await connection.execute(`
            SELECT 
                id,
                numero_orden,
                email_comprador,
                nombre_comprador,
                total,
                estado,
                fecha_orden
            FROM orders 
            ORDER BY fecha_orden DESC 
            LIMIT 5
        `);
        console.table(orders);
        
        // Ver los últimos user_orders 
        console.log('\n📋 ÚLTIMOS 5 USER_ORDERS:');
        const [userOrders] = await connection.execute(`
            SELECT 
                uo.id,
                uo.user_id,
                uo.order_id,
                uo.gift_card_codes,
                uo.total_amount,
                uo.tipo,
                u.gmail as user_email,
                o.numero_orden,
                o.email_comprador,
                uo.purchase_date
            FROM user_orders uo
            LEFT JOIN usuarios u ON uo.user_id = u.id
            LEFT JOIN orders o ON uo.order_id = o.id
            ORDER BY uo.purchase_date DESC
            LIMIT 5
        `);
        console.table(userOrders);
        
        // Verificar si hay órdenes sin user_orders
        console.log('\n⚠️  ÓRDENES SIN USER_ORDERS:');
        const [missing] = await connection.execute(`
            SELECT 
                o.id,
                o.numero_orden,
                o.email_comprador,
                o.total,
                o.fecha_orden
            FROM orders o
            LEFT JOIN user_orders uo ON o.id = uo.order_id
            WHERE uo.order_id IS NULL
            ORDER BY o.fecha_orden DESC
            LIMIT 3
        `);
        
        if (missing.length === 0) {
            console.log('✅ Todas las órdenes tienen su correspondiente user_orders');
        } else {
            console.log('❌ Estas órdenes NO tienen user_orders:');
            console.table(missing);
        }
        
        // Ver usuarios disponibles
        console.log('\n👥 USUARIOS DISPONIBLES:');
        const [users] = await connection.execute(`
            SELECT id, nombre, usuario, gmail, fecha_registro
            FROM usuarios 
            ORDER BY fecha_registro DESC
            LIMIT 5
        `);
        console.table(users);
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

checkRecentOrders();