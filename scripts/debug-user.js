const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function debugUser(emailToDebug) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log(`🔍 Depurando usuario: ${emailToDebug}\n`);
        
        // 1. Verificar si el usuario existe en la tabla usuarios
        console.log('👤 Buscando en tabla usuarios:');
        const [users] = await connection.execute(`
            SELECT id, nombre, usuario, gmail 
            FROM usuarios 
            WHERE gmail = ? OR usuario = ?
        `, [emailToDebug, emailToDebug]);
        
        if (users.length === 0) {
            console.log('❌ Usuario NO encontrado en tabla usuarios');
            console.log('\n📋 Usuarios disponibles:');
            const [allUsers] = await connection.execute('SELECT id, nombre, usuario, gmail FROM usuarios');
            console.table(allUsers);
            return;
        } else {
            console.log('✅ Usuario encontrado:');
            console.table(users);
            const userId = users[0].id;
            
            // 2. Buscar órdenes donde este usuario es el comprador
            console.log('\n🛒 Órdenes donde es COMPRADOR (en tabla orders):');
            const [ordersAsComprador] = await connection.execute(`
                SELECT numero_orden, email_comprador, total, estado, fecha_orden
                FROM orders 
                WHERE email_comprador = ?
                ORDER BY fecha_orden DESC
            `, [emailToDebug]);
            
            if (ordersAsComprador.length === 0) {
                console.log('❌ No tiene órdenes como comprador');
            } else {
                console.table(ordersAsComprador);
            }
            
            // 3. Buscar registros en user_orders
            console.log('\n📋 Registros en user_orders:');
            const [userOrders] = await connection.execute(`
                SELECT 
                    uo.id,
                    uo.user_id,
                    uo.order_id,
                    uo.gift_card_codes,
                    uo.total_amount,
                    uo.tipo,
                    o.numero_orden,
                    o.email_comprador
                FROM user_orders uo
                LEFT JOIN orders o ON uo.order_id = o.id
                WHERE uo.user_id = ?
                ORDER BY uo.id DESC
            `, [userId]);
            
            if (userOrders.length === 0) {
                console.log('❌ No tiene registros en user_orders');
                
                // Verificar si hay órdenes que deberían estar asociadas
                if (ordersAsComprador.length > 0) {
                    console.log('\n⚠️  PROBLEMA DETECTADO: Hay órdenes pero no registros en user_orders');
                    console.log('Esto explica por qué no ve su historial de compras');
                }
            } else {
                console.table(userOrders);
            }
            
            // 4. Buscar gift cards donde es destinatario
            console.log('\n🎁 Gift Cards donde es DESTINATARIO:');
            const [giftCards] = await connection.execute(`
                SELECT codigo, valor_inicial, saldo_actual, email_destinatario, fecha_creacion
                FROM gift_cards 
                WHERE email_destinatario = ?
                ORDER BY fecha_creacion DESC
            `, [emailToDebug]);
            
            if (giftCards.length === 0) {
                console.log('❌ No tiene gift cards como destinatario');
            } else {
                console.table(giftCards);
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

// Usar el email de tu compañero aquí
const emailToDebug = process.argv[2] || 'alexanderviveros9@gmail.com'; // Por defecto usar este
console.log(`Depurando usuario: ${emailToDebug}`);
debugUser(emailToDebug);