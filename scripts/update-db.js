const mysql = require('mysql2/promise');

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'gift-card'
  });

  try {
    console.log('Conectando a la base de datos...');
    
    // Verificar si la columna empresa ya existe
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM gift_cards LIKE 'empresa'"
    );
    
    if (columns.length === 0) {
      console.log('Agregando columna empresa...');
      await connection.execute(
        'ALTER TABLE gift_cards ADD COLUMN empresa VARCHAR(255) DEFAULT NULL AFTER email_destinatario'
      );
      console.log('Columna empresa agregada exitosamente');
    } else {
      console.log('La columna empresa ya existe');
    }
    
    // Verificar si la columna mensaje existe
    const [mensajeColumns] = await connection.execute(
      "SHOW COLUMNS FROM gift_cards LIKE 'mensaje'"
    );
    
    if (mensajeColumns.length === 0) {
      console.log('Agregando columna mensaje...');
      await connection.execute(
        'ALTER TABLE gift_cards ADD COLUMN mensaje TEXT DEFAULT NULL AFTER empresa'
      );
      console.log('Columna mensaje agregada exitosamente');
    } else {
      console.log('La columna mensaje ya existe');
    }
    
    console.log('Base de datos actualizada correctamente');
    
  } catch (error) {
    console.error('Error al actualizar la base de datos:', error);
  } finally {
    await connection.end();
  }
}

updateDatabase();
