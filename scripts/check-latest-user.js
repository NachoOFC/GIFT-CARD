const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function checkLatestUser() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 Verificando usuarios más recientes...\n');
        
        // Ver los últimos usuarios registrados
        console.log('👥 ÚLTIMOS USUARIOS REGISTRADOS:');
        const [users] = await connection.execute(`
            SELECT 
                id,
                nombre,
                usuario,
                gmail,
                fecha_registro,
                ultimo_login
            FROM usuarios 
            ORDER BY fecha_registro DESC 
            LIMIT 5
        `);
        console.table(users);
        
        // Ver la última compra
        console.log('\n📦 ÚLTIMA COMPRA REALIZADA:');
        const [lastOrder] = await connection.execute(`
            SELECT 
                id,
                numero_orden,
                email_comprador,
                nombre_comprador,
                total,
                fecha_orden
            FROM orders 
            ORDER BY fecha_orden DESC 
            LIMIT 1
        `);
        console.table(lastOrder);
        
        // Ver user_orders de la última compra
        if (lastOrder.length > 0) {
            console.log('\n📋 USER_ORDERS de la última compra:');
            const [userOrder] = await connection.execute(`
                SELECT 
                    uo.id,
                    uo.user_id,
                    uo.order_id,
                    uo.gift_card_codes,
                    uo.total_amount,
                    uo.tipo,
                    u.nombre as user_name,
                    u.gmail as user_email
                FROM user_orders uo
                LEFT JOIN usuarios u ON uo.user_id = u.id
                WHERE uo.order_id = ?
            `, [lastOrder[0].id]);
            console.table(userOrder);
            
            if (userOrder.length > 0) {
                console.log('\n🚨 PROBLEMA DETECTADO:');
                console.log(`• La orden está registrada para: ${lastOrder[0].email_comprador}`);
                console.log(`• Pero user_orders apunta al usuario ID: ${userOrder[0].user_id} (${userOrder[0].user_email})`);
                console.log(`• Si compraste con una cuenta diferente, este es el problema`);
            }
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

checkLatestUser();