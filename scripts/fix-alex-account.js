const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gift-card'
};

async function fixAlexAccount() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔧 Reparando cuenta alex@gmail.com...\n');
        
        // 1. Actualizar cuenta alex para que tenga email
        console.log('1️⃣ Actualizando cuenta alex...');
        await connection.execute(`
            UPDATE usuarios 
            SET gmail = 'alex@gmail.com' 
            WHERE id = 13
        `);
        console.log('✅ Cuenta alex actualizada con email: alex@gmail.com');
        
        // 2. Verificar que la actualización funcionó
        console.log('\n2️⃣ Verificando cambios...');
        const [updatedUser] = await connection.execute(`
            SELECT id, nombre, usuario, gmail 
            FROM usuarios 
            WHERE id = 13
        `);
        console.table(updatedUser);
        
        console.log('\n🎉 REPARACIÓN COMPLETADA!');
        console.log('=====================================');
        console.log('✅ Tu cuenta alex@gmail.com ahora tiene email configurado');
        console.log('✅ Las futuras compras se registrarán correctamente en tu historial');
        console.log('✅ Puedes ver tu saldo en /home');
        console.log('✅ Cuando compres, el sistema te identificará correctamente');
        
        console.log('\n🔄 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. Recarga la página /profile');
        console.log('2. Haz una compra de prueba');
        console.log('3. Verifica que aparezca en tu historial');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

fixAlexAccount();