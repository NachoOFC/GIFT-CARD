import mysql from 'mysql2/promise';

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',  
  database: 'gift-card',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
