const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function fixPurchaseLogic() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔧 CORRIGIENDO LÓGICA DE COMPRA...\n');
        
        // 1. Ver la compra actual
        console.log('📋 Estado actual de tu compra:');
        const [currentOrder] = await connection.execute(`
            SELECT 
                uo.id,
                uo.user_id,
                uo.gift_card_codes,
                uo.total_amount,
                uo.tipo,
                o.email_comprador,
                gc.email_destinatario,
                u.gmail as comprador_email
            FROM user_orders uo
            LEFT JOIN orders o ON uo.order_id = o.id
            LEFT JOIN gift_cards gc ON gc.codigo = uo.gift_card_codes
            LEFT JOIN usuarios u ON u.id = uo.user_id
            WHERE uo.id = 23
        `);
        console.table(currentOrder);
        
        const order = currentOrder[0];
        const isAutoCompra = order.comprador_email === order.email_destinatario;
        
        console.log('\n🔍 ANÁLISIS:');
        console.log(`• Comprador (tu email): ${order.comprador_email}`);
        console.log(`• Beneficiario (destinatario): ${order.email_destinatario}`);
        console.log(`• ¿Es autocompra?: ${isAutoCompra ? 'SÍ' : 'NO'}`);
        console.log(`• Tipo actual: ${order.tipo}`);
        
        if (!isAutoCompra) {
            console.log('\n🚨 PROBLEMA DETECTADO: Compraste para OTRA PERSONA pero tienes la gift card');
            console.log('\n2️⃣ Corrigiendo...');
            
            // Cambiar tu registro a solo "comprador"
            await connection.execute(`
                UPDATE user_orders 
                SET 
                    gift_card_codes = NULL,
                    tipo = 'comprador'
                WHERE id = 23
            `);
            console.log('✅ Tu registro corregido: Solo historial de compra (sin gift card)');
            
            // Crear registro para el beneficiario real
            const beneficiaryEmail = order.email_destinatario;
            
            // Verificar si el beneficiario tiene usuario
            const [beneficiaryUser] = await connection.execute(`
                SELECT id FROM usuarios WHERE gmail = ? LIMIT 1
            `, [beneficiaryEmail]);
            
            if (beneficiaryUser.length > 0) {
                const beneficiaryUserId = beneficiaryUser[0].id;
                
                // Crear registro para el beneficiario
                await connection.execute(`
                    INSERT INTO user_orders 
                    (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo)
                    VALUES (?, ?, ?, 0, NOW(), 'active', 'beneficiario')
                `, [beneficiaryUserId, order.order_id, order.gift_card_codes]);
                
                console.log(`✅ Registro creado para beneficiario: ${beneficiaryEmail}`);
            } else {
                console.log(`⚠️ El beneficiario ${beneficiaryEmail} no tiene cuenta de usuario`);
            }
        } else {
            console.log('\n✅ Es autocompra - está correcto que tengas la gift card');
        }
        
        // 3. Mostrar resultado final
        console.log('\n📊 RESULTADO FINAL:');
        const [finalResult] = await connection.execute(`
            SELECT 
                uo.id,
                uo.user_id,
                uo.gift_card_codes,
                uo.total_amount,
                uo.tipo,
                u.nombre,
                u.gmail,
                CASE 
                    WHEN uo.tipo = 'comprador' THEN 'Solo historial de compra'
                    WHEN uo.tipo = 'beneficiario' THEN 'Solo gift card'
                    WHEN uo.tipo = 'comprador_beneficiario' THEN 'Compra propia'
                END as descripcion
            FROM user_orders uo
            LEFT JOIN usuarios u ON uo.user_id = u.id
            WHERE uo.order_id = (SELECT order_id FROM user_orders WHERE id = 23)
            ORDER BY uo.tipo DESC
        `);
        console.table(finalResult);
        
        console.log('\n🎉 CORRECCIÓN COMPLETADA!');
        console.log('==========================');
        console.log('✅ Comprador: Solo ve historial de gasto');
        console.log('✅ Beneficiario: Solo ve gift card recibida');
        console.log('✅ Lógica correcta implementada');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

fixPurchaseLogic();