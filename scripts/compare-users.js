const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function checkBothUsers() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 Comparando ambos usuarios...\n');
        
        // Usuario 1: alex@gmail.com (ID 13)
        console.log('👤 USUARIO ACTUAL (alex@gmail.com - ID 13):');
        const [alexUser] = await connection.execute(`
            SELECT id, nombre, usuario, gmail 
            FROM usuarios 
            WHERE id = 13 OR usuario = 'alex@gmail.com'
        `);
        console.table(alexUser);
        
        // Órdenes de alex@gmail.com
        const [alexOrders] = await connection.execute(`
            SELECT numero_orden, email_comprador, total, estado, fecha_orden
            FROM orders 
            WHERE email_comprador = 'alex@gmail.com'
            ORDER BY fecha_orden DESC
        `);
        console.log(`📦 Órdenes como comprador: ${alexOrders.length}`);
        if (alexOrders.length > 0) console.table(alexOrders);
        
        // user_orders de alex (ID 13)
        const [alexUserOrders] = await connection.execute(`
            SELECT * FROM user_orders WHERE user_id = 13
        `);
        console.log(`📋 Registros en user_orders: ${alexUserOrders.length}`);
        if (alexUserOrders.length > 0) console.table(alexUserOrders);
        
        console.log('\n' + '='.repeat(50));
        
        // Usuario 2: alexanderviveros9@gmail.com (ID 11)
        console.log('👤 USUARIO CON COMPRAS (alexanderviveros9@gmail.com - ID 11):');
        const [lucasUser] = await connection.execute(`
            SELECT id, nombre, usuario, gmail 
            FROM usuarios 
            WHERE id = 11
        `);
        console.table(lucasUser);
        
        // Órdenes recientes de alexanderviveros9@gmail.com
        const [lucasOrders] = await connection.execute(`
            SELECT numero_orden, email_comprador, total, estado, fecha_orden
            FROM orders 
            WHERE email_comprador = 'alexanderviveros9@gmail.com'
            ORDER BY fecha_orden DESC
            LIMIT 3
        `);
        console.log(`📦 Órdenes como comprador: ${lucasOrders.length} (mostrando últimas 3)`);
        console.table(lucasOrders);
        
        // user_orders de lucas (ID 11) - últimos 3
        const [lucasUserOrders] = await connection.execute(`
            SELECT * FROM user_orders WHERE user_id = 11 ORDER BY id DESC LIMIT 3
        `);
        console.log(`📋 Registros en user_orders: ${lucasUserOrders.length} (mostrando últimos 3)`);
        console.table(lucasUserOrders);
        
        console.log('\n🎯 CONCLUSIÓN:');
        console.log(`- Usuario alex@gmail.com (ID 13): ${alexOrders.length} compras`);
        console.log(`- Usuario alexanderviveros9@gmail.com (ID 11): ${lucasOrders.length}+ compras`);
        console.log('\n✅ Para ver tu historial, debes loguearte como: alexanderviveros9@gmail.com');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

checkBothUsers();