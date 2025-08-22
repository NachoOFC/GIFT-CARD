import pool from '@/utils/db';
import webpayService from '@/services/webpayService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { token_ws, orderId } = req.body;

    if (!token_ws) {
      return res.status(400).json({ 
        success: false,
        message: 'Token de WebPay requerido' 
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Procesar la respuesta de WebPay
      const result = await webpayService.processWebPayResponse(token_ws, orderId);

      if (result.success) {
        // Actualizar la orden como pagada
        await connection.execute(
          'UPDATE orders SET estado = ?, fecha_pago = NOW() WHERE numero_orden = ?',
          ['pagado', orderId]
        );

        // Aquí podrías agregar lógica adicional como:
        // - Enviar email de confirmación
        // - Generar gift cards
        // - Actualizar inventario
      }

      await connection.commit();

      return res.status(200).json({ 
        success: true, 
        message: 'Pago confirmado correctamente',
        transactionData: result.transactionData
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error procesando respuesta WebPay:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la respuesta: ' + error.message
    });
  }
}
