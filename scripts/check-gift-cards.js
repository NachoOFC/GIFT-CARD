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
        
        console.log('🎁 Revisando tabla gift_cards...\n');
        
        // Revisar estructura de gift_cards
        console.log('📋 Estructura de la tabla gift_cards:');
        const [columns] = await connection.execute('DESCRIBE gift_cards');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} (${col.Null})`);
        });
        
        console.log('\n📊 Gift Cards recientes:');
        const [giftCards] = await connection.execute(`
            SELECT 
                id,
                codigo,
                email_destinatario,
                valor_inicial,
                saldo_actual,
                activa,
                fecha_creacion,
                empresa,
                order_id
            FROM gift_cards 
            ORDER BY fecha_creacion DESC 
            LIMIT 5
        `);
        
        if (giftCards.length === 0) {
            console.log('No hay gift cards en la base de datos');
        } else {
            console.table(giftCards);
        }
        
        // Revisar relación con user_orders
        console.log('\n📋 Revisando user_orders:');
        const [userOrders] = await connection.execute(`
            SELECT 
                uo.id,
                uo.email_usuario,
                uo.numero_orden,
                o.email_comprador,
                o.total,
                o.estado
            FROM user_orders uo
            LEFT JOIN orders o ON uo.numero_orden = o.numero_orden
            ORDER BY uo.id DESC
            LIMIT 5
        `);
        
        if (userOrders.length === 0) {
            console.log('No hay registros en user_orders');
        } else {
            console.table(userOrders);
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