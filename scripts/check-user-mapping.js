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
        
        console.log('🔍 Verificando usuarios y sus IDs...\n');
        
        // Mostrar todos los usuarios con sus IDs
        const [users] = await connection.execute(`
            SELECT id, nombre, usuario, gmail as email 
            FROM usuarios 
            ORDER BY id
        `);
        
        console.log('👥 Usuarios registrados:');
        console.table(users);
        
        console.log('\n🔍 Verificando órdenes por email:');
        
        // Mostrar órdenes por email_comprador
        const [ordersByEmail] = await connection.execute(`
            SELECT 
                numero_orden,
                email_comprador,
                total,
                estado,
                fecha_orden
            FROM orders 
            ORDER BY fecha_orden DESC
        `);
        
        console.table(ordersByEmail);
        
        console.log('\n🔍 Verificando user_orders con información de usuario:');
        
        // Mostrar user_orders con información del usuario
        const [userOrdersWithInfo] = await connection.execute(`
            SELECT 
                uo.id,
                uo.user_id,
                u.nombre,
                u.gmail as user_email,
                uo.order_id,
                o.numero_orden,
                o.email_comprador,
                uo.tipo,
                uo.total_amount
            FROM user_orders uo
            JOIN usuarios u ON uo.user_id = u.id
            JOIN orders o ON uo.order_id = o.id
            ORDER BY uo.id DESC
            LIMIT 10
        `);
        
        console.table(userOrdersWithInfo);
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

main();