import pool from '@/utils/db';

export default async function handler(req, res) {
  const { method } = req;

  // Manejar verificación de código existente
  if (method === 'GET' && req.query.codigo) {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(
          'SELECT COUNT(*) as count FROM gift_cards WHERE codigo = ?',
          [req.query.codigo]
        );
        return res.status(200).json({ 
          success: true, 
          exists: rows[0].count > 0
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al verificar código' 
      });
    }
  }

  switch (method) {
    case 'GET':
      try {
        const connection = await pool.getConnection();
        try {
          const [giftCards] = await connection.query('SELECT * FROM gift_cards');
          return res.status(200).json({ 
            success: true, 
            data: giftCards
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error al obtener gift cards:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al obtener gift cards' 
        });
      }
      break;

    case 'POST':
      try {
        const { codigo, valor_inicial, fecha_expiracion, email_destinatario, mensaje, empresa } = req.body;
        
        if (!codigo || !valor_inicial) {
          return res.status(400).json({ 
            success: false, 
            message: 'Se requieren código y monto' 
          });
        }

        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          
          const [result] = await connection.execute(
            'INSERT INTO gift_cards (codigo, valor_inicial, saldo_actual, fecha_expiracion, email_destinatario, mensaje) VALUES (?, ?, ?, ?, ?, ?)',
            [codigo, valor_inicial, valor_inicial, fecha_expiracion, email_destinatario, mensaje]
          );

          await connection.commit();
          
          return res.status(201).json({ 
            success: true, 
            message: 'Gift card creada exitosamente',
            data: result
          });
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error al crear gift card:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al crear gift card' 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
