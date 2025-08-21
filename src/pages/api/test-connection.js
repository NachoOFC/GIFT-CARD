import pool from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      // Obtener todas las tablas de la base de datos
      const [tables] = await connection.query('SHOW TABLES');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Conexión exitosa',
        tables
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al conectar con la base de datos' 
    });
  }
}
