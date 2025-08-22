import pool from '@/utils/db';
import webpayService from '@/services/webpayService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { orderId, amount, items, customerName, customerEmail } = req.body;

    if (!orderId || !amount || !items) {
      return res.status(400).json({ 
        success: false,
        message: 'Se requieren orderId, amount e items' 
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Preparar datos para WebPay
      const orderData = {
        orderId,
        totalAmount: amount,
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          title: item.title
        })),
        customerName: customerName || 'Cliente Web',
        customerEmail: customerEmail || 'cliente@web.com'
      };

      // Iniciar pago con WebPay
      const paymentResult = await webpayService.initiateWebPayPayment(orderData);

      // Guardar información de la transacción en la base de datos
      // Primero verificar si la orden existe, si no, crearla
      const [existingOrder] = await connection.execute(
        'SELECT id FROM orders WHERE numero_orden = ?',
        [orderId]
      );

      if (existingOrder.length === 0) {
        // Crear nueva orden
        await connection.execute(
          'INSERT INTO orders (numero_orden, estado, webpay_token, fecha_orden, total, email_comprador, nombre_comprador) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
          [orderId, 'pendiente', paymentResult.webpayResponse.token, amount, orderData.customerEmail, orderData.customerName]
        );
      } else {
        // Actualizar orden existente
        await connection.execute(
          'UPDATE orders SET estado = ?, webpay_token = ?, fecha_orden = NOW(), total = ? WHERE numero_orden = ?',
          ['pendiente', paymentResult.webpayResponse.token, amount, orderId]
        );
      }

      await connection.commit();

      return res.status(200).json({ 
        success: true, 
        message: 'Pago iniciado correctamente',
        redirectUrl: paymentResult.redirectUrl,
        token: paymentResult.webpayResponse.token,
        buyOrder: paymentResult.webpayResponse.buy_order
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
      message: 'Error al procesar el pago: ' + error.message
    });
  }
}
