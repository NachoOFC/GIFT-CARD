import pool from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Se requieren orderId y amount' });
    }

    const connection = await pool.getConnection();

    try {
      // Aquí puedes agregar la lógica para procesar el pago
      // Por ejemplo, actualizar el estado de la orden en la base de datos

      await connection.beginTransaction();

      // Ejemplo de actualización de una orden
      await connection.execute(
        'UPDATE ordenes SET estado = ?, fecha_pago = NOW() WHERE id = ?',
        ['PAGADA', orderId]
      );

      await connection.commit();

      return res.status(200).json({ 
        success: true, 
        message: 'Pago procesado correctamente'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el pago' 
    });
  }
}
