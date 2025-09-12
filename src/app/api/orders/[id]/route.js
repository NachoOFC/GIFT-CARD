import pool from '@/utils/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({
        success: false,
        error: 'ID de orden requerido'
      }, { status: 400 });
    }

    // Buscar la orden por número de orden
    const [orders] = await pool.execute(`
      SELECT 
        id,
        numero_orden,
        email_comprador,
        nombre_comprador,
        total,
        estado,
        metodo_pago,
        fecha_orden
      FROM orders 
      WHERE numero_orden = ?
      LIMIT 1
    `, [id]);

    console.log('🔍 Orden encontrada:', orders[0]); // Para debug

    if (orders.length === 0) {
      return Response.json({
        success: false,
        error: 'Orden no encontrada'
      }, { status: 404 });
    }

    const order = orders[0];

    return Response.json({
      success: true,
      order: {
        id: order.id,
        numero_orden: order.numero_orden,
        email_comprador: order.email_comprador,
        nombre_comprador: order.nombre_comprador,
        total: parseFloat(order.total) || 0,
        estado: order.estado,
        metodo_pago: order.metodo_pago,
        fecha_orden: order.fecha_orden
      }
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    return Response.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
