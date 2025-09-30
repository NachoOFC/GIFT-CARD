import mysql from 'mysql2/promise';
import { databaseConfig } from './database';

// Crear pool de conexiones
const pool = mysql.createPool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Método query para usar en los endpoints
const db = {
  query: async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
};

export default db;
