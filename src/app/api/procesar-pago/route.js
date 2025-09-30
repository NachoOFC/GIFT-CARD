import { NextResponse } from 'next/server';
import db from '@/config/db';

// Endpoint para procesar el pago Webpay y marcar la orden como pagada
export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, token, buy_order, amount, webpay_response } = body;

    // Validar datos mínimos
    if (!order_id || !token || !buy_order || !amount) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    // Aquí podrías validar la respuesta de Webpay (webpay_response)
    // Por ejemplo, verificar que el pago fue exitoso
    if (!webpay_response || webpay_response.status !== 'AUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Pago no autorizado por Webpay.' }, { status: 402 });
    }

    // Actualizar la orden en la base de datos a estado "pagada"
    try {
      await db.query('UPDATE orders SET estado = ? WHERE numero_orden = ?', ['pagada', order_id]);
    } catch (dbError) {
      return NextResponse.json({ success: false, error: 'Error actualizando orden en la base de datos.' }, { status: 500 });
    }

    // Puedes retornar los datos necesarios para la página de éxito
    return NextResponse.json({ success: true, order_id, amount, buy_order });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
