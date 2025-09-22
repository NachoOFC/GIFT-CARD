const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function fixYourAccount() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔧 ARREGLANDO TU CUENTA...\n');
        
        // 1. Arreglar tu cuenta (ID 14)
        console.log('1️⃣ Actualizando tu cuenta con email...');
        await connection.execute(`
            UPDATE usuarios 
            SET gmail = 'alexander2020@gmail.com'
            WHERE id = 14
        `);
        console.log('✅ Tu cuenta ahora tiene email: alexander2020@gmail.com');
        
        // 2. Transferir la última compra a tu cuenta
        console.log('\n2️⃣ Transfiriendo tu compra más reciente...');
        await connection.execute(`
            UPDATE user_orders 
            SET user_id = 14, tipo = 'comprador'
            WHERE id = 23
        `);
        console.log('✅ Compra transferida a tu cuenta (ID 14)');
        
        // 3. Verificar los cambios
        console.log('\n3️⃣ Verificando cambios...');
        const [updatedUser] = await connection.execute(`
            SELECT id, nombre, usuario, gmail FROM usuarios WHERE id = 14
        `);
        console.table(updatedUser);
        
        const [updatedOrder] = await connection.execute(`
            SELECT 
                uo.id,
                uo.user_id,
                uo.total_amount,
                uo.tipo,
                u.nombre,
                u.gmail
            FROM user_orders uo
            LEFT JOIN usuarios u ON uo.user_id = u.id
            WHERE uo.id = 23
        `);
        console.table(updatedOrder);
        
        // 4. Mostrar tu historial completo
        console.log('\n4️⃣ Tu historial de compras (usuario ID 14):');
        const [yourPurchases] = await connection.execute(`
            SELECT 
                uo.id,
                uo.gift_card_codes,
                uo.total_amount,
                uo.tipo,
                uo.purchase_date,
                o.numero_orden
            FROM user_orders uo
            LEFT JOIN orders o ON uo.order_id = o.id
            WHERE uo.user_id = 14
            ORDER BY uo.purchase_date DESC
        `);
        
        if (yourPurchases.length > 0) {
            console.table(yourPurchases);
        } else {
            console.log('❌ Aún no tienes compras registradas');
        }
        
        console.log('\n🎉 ARREGLO COMPLETADO!');
        console.log('=======================');
        console.log('✅ Tu cuenta tiene email configurado');
        console.log('✅ Tu compra más reciente está asociada a tu cuenta');
        console.log('✅ Ahora ve a /profile y deberías ver tu historial');
        console.log('\n🔄 ACTUALIZA LA PÁGINA /profile para ver los cambios');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

fixYourAccount();