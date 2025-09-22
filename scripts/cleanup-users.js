const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function cleanupUsersWithoutEmail() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🧹 LIMPIANDO CUENTAS SIN EMAIL...\n');
        
        // 1. Mostrar usuarios sin email
        console.log('👀 Usuarios SIN email configurado:');
        const [usersWithoutEmail] = await connection.execute(`
            SELECT id, nombre, usuario, gmail, fecha_registro
            FROM usuarios 
            WHERE gmail IS NULL OR gmail = ''
        `);
        console.table(usersWithoutEmail);
        
        // 2. Verificar si tienen compras asociadas
        console.log('\n🔍 Verificando si tienen compras asociadas:');
        const [purchasesCheck] = await connection.execute(`
            SELECT 
                u.id as user_id,
                u.nombre,
                u.usuario,
                COUNT(uo.id) as total_compras,
                SUM(uo.total_amount) as total_gastado
            FROM usuarios u
            LEFT JOIN user_orders uo ON u.id = uo.user_id
            WHERE u.gmail IS NULL OR u.gmail = ''
            GROUP BY u.id
        `);
        console.table(purchasesCheck);
        
        // 3. Eliminar usuarios sin email que NO tengan compras
        const usersToDelete = purchasesCheck.filter(user => user.total_compras === 0);
        
        if (usersToDelete.length > 0) {
            console.log('\n🗑️  Eliminando usuarios sin email y sin compras:');
            
            for (const user of usersToDelete) {
                console.log(`Eliminando usuario: ID ${user.user_id} - ${user.nombre} (${user.usuario})`);
                await connection.execute(`DELETE FROM usuarios WHERE id = ?`, [user.user_id]);
            }
            
            console.log(`✅ ${usersToDelete.length} usuario(s) eliminado(s)`);
        } else {
            console.log('\n ℹ️ No hay usuarios sin email para eliminar (todos tienen compras)');
        }
        
        // 4. Mostrar usuarios con compras pero sin email (requieren atención manual)
        const usersWithPurchasesNoEmail = purchasesCheck.filter(user => user.total_compras > 0);
        if (usersWithPurchasesNoEmail.length > 0) {
            console.log('\n⚠️  USUARIOS CON COMPRAS PERO SIN EMAIL (requieren email):');
            console.table(usersWithPurchasesNoEmail);
            console.log('💡 Estos usuarios necesitan un email válido para funcionar correctamente');
        }
        
        // 5. Mostrar estado final
        console.log('\n📋 USUARIOS RESTANTES:');
        const [remainingUsers] = await connection.execute(`
            SELECT 
                u.id,
                u.nombre,
                u.usuario,
                u.gmail,
                COUNT(uo.id) as compras,
                COALESCE(SUM(uo.total_amount), 0) as total_gastado
            FROM usuarios u
            LEFT JOIN user_orders uo ON u.id = uo.user_id
            GROUP BY u.id
            ORDER BY u.id
        `);
        console.table(remainingUsers);
        
        console.log('\n🎉 LIMPIEZA COMPLETADA!');
        console.log('========================');
        console.log('✅ Usuarios sin email y sin compras: ELIMINADOS');
        console.log('✅ Base de datos más limpia');
        console.log('✅ Solo quedan usuarios válidos');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

cleanupUsersWithoutEmail();