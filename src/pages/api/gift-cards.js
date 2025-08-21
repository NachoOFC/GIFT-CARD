import pool from '@/utils/db';

export default async function handler(req, res) {
  const { method } = req;

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
        const { code, amount, expiration_date } = req.body;
        
        if (!code || !amount) {
          return res.status(400).json({ 
            success: false, 
            message: 'Se requieren código y monto' 
          });
        }

        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          
          const [result] = await connection.execute(
            'INSERT INTO gift_cards (code, amount, expiration_date) VALUES (?, ?, ?)',
            [code, amount, expiration_date]
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
