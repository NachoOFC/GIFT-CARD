import pool from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Probar conexión
    const connection = await pool.getConnection();
    
    // Información de la conexión
    const connectionInfo = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || '3306',
      database: process.env.DB_NAME || 'gift-card',
      user: process.env.DB_USER || 'root',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    // Probar consulta simple
    const [testResult] = await connection.execute('SELECT 1 as test');
    
    // Verificar si la tabla gift_cards existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'gift_cards'"
    );
    
    // Contar registros si la tabla existe
    let giftCardCount = 0;
    if (tables.length > 0) {
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM gift_cards'
      );
      giftCardCount = countResult[0].total;
    }

    // Verificar estructura de la tabla
    let tableStructure = [];
    if (tables.length > 0) {
      const [columns] = await connection.execute('DESCRIBE gift_cards');
      tableStructure = columns.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default
      }));
    }

    connection.release();

    return res.status(200).json({
      success: true,
      message: 'Conexión a la base de datos exitosa',
      data: {
        connection: connectionInfo,
        test: testResult[0],
        tableExists: tables.length > 0,
        giftCardCount,
        tableStructure
      }
    });

  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error de conexión a la base de datos',
      error: {
        code: error.code,
        message: error.message,
        sqlState: error.sqlState
      },
      suggestions: {
        checkEnvVars: 'Verifica que las variables de entorno DB_* estén configuradas',
        checkDatabase: 'Asegúrate de que la base de datos esté accesible',
        checkCredentials: 'Verifica usuario y contraseña de la base de datos'
      }
    });
  }
}
