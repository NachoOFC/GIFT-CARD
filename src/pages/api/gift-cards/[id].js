import pool from '@/utils/db';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID requerido' 
    });
  }

  switch (method) {
    case 'DELETE':
      try {
        const connection = await pool.getConnection();
        try {
          const [result] = await connection.execute(
            'DELETE FROM gift_cards WHERE id = ?',
            [id]
          );
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ 
              success: false, 
              message: 'Gift card no encontrada' 
            });
          }
          
          return res.status(200).json({ 
            success: true, 
            message: 'Gift card eliminada exitosamente' 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error al eliminar gift card:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al eliminar gift card' 
        });
      }
      break;

    case 'PUT':
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
          
          // Verificar si el código ya existe en otra gift card
          const [existing] = await connection.query(
            'SELECT id FROM gift_cards WHERE codigo = ? AND id != ?',
            [codigo, id]
          );
          if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ 
              success: false, 
              message: 'El código ya existe en otra gift card' 
            });
          }
          
          const [result] = await connection.execute(
            'UPDATE gift_cards SET codigo = ?, valor_inicial = ?, saldo_actual = ?, fecha_expiracion = ?, email_destinatario = ?, empresa = ?, mensaje = ? WHERE id = ?',
            [codigo, valor_inicial, valor_inicial, fecha_expiracion, email_destinatario, empresa, mensaje, id]
          );

          if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ 
              success: false, 
              message: 'Gift card no encontrada' 
            });
          }

          await connection.commit();
          
          return res.status(200).json({ 
            success: true, 
            message: 'Gift card actualizada exitosamente' 
          });
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error al actualizar gift card:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al actualizar gift card' 
        });
      }
      break;

    case 'GET':
      try {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.query(
            'SELECT * FROM gift_cards WHERE id = ?',
            [id]
          );
          
          if (rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              message: 'Gift card no encontrada' 
            });
          }
          
          return res.status(200).json({ 
            success: true, 
            data: rows[0] 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error al obtener gift card:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al obtener gift card' 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
