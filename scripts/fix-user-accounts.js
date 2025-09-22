const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function fixUserAccountConnection() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔧 REPARANDO CONEXIÓN DE CUENTA DE USUARIO...\n');
        
        console.log('OPCIÓN 1: UNIFICAR CUENTAS');
        console.log('=============================');
        console.log('• Transferir todas las compras de alexanderviveros9@gmail.com a alex@gmail.com');
        console.log('• Tu cuenta actual (alex@gmail.com) tendrá TODAS las compras');
        console.log('• Solo tendrás 1 cuenta');
        
        console.log('\nOPCIÓN 2: COMPLETAR CUENTA ALEX');
        console.log('===============================');
        console.log('• Agregar gmail "alex@gmail.com" a tu cuenta alex');
        console.log('• Futuras compras se registrarán correctamente');
        console.log('• Mantener ambas cuentas por separado');
        
        console.log('\nOPCIÓN 3: DATOS ACTUALES');
        console.log('========================');
        
        // Mostrar usuarios
        const [users] = await connection.execute(`
            SELECT id, nombre, usuario, gmail, fecha_registro
            FROM usuarios 
            WHERE id IN (11, 13)
            ORDER BY id
        `);
        console.table(users);
        
        // Mostrar compras por usuario
        console.log('📦 COMPRAS POR USUARIO:');
        const [purchases] = await connection.execute(`
            SELECT 
                u.id as user_id,
                u.nombre,
                u.gmail,
                COUNT(uo.id) as total_compras,
                SUM(uo.total_amount) as total_gastado
            FROM usuarios u
            LEFT JOIN user_orders uo ON u.id = uo.user_id
            WHERE u.id IN (11, 13)
            GROUP BY u.id
            ORDER BY u.id
        `);
        console.table(purchases);
        
        console.log('\n💡 RECOMENDACIÓN:');
        console.log('=================');
        console.log('Para que CUALQUIER usuario pueda comprar y ver su historial:');
        console.log('1. Ejecutar OPCIÓN 2 (más simple)');
        console.log('2. Asegurar que el sistema siempre use el email de la sesión activa');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

fixUserAccountConnection();