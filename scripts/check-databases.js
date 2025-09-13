const mysql = require('mysql2/promise');

// Configuración básica sin especificar base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
};

async function main() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 Verificando bases de datos disponibles...\n');
        
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📋 Bases de datos encontradas:');
        databases.forEach(db => {
            console.log(`  - ${db.Database}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) {
            await connection.end();
        }
    }
}

main();