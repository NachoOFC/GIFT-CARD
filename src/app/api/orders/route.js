import pool from '@/utils/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId) {
      return Response.json({ 
        success: false, 
        message: 'ID de usuario requerido' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    let results;

    try {
      if (type === 'orders') {
        // Obtener órdenes del usuario a través de user_orders
        const ordersQuery = `
          SELECT 
            o.*,
            uo.gift_card_codes,
            uo.total_amount,
            uo.purchase_date,
            uo.status as order_status
          FROM user_orders uo
          JOIN orders o ON uo.order_id = o.id
          WHERE uo.user_id = ?
          ORDER BY uo.purchase_date DESC
        `;
        const [rows] = await connection.execute(ordersQuery, [userId]);
        results = rows;
      } else {
        // Obtener gift cards del usuario a través de user_orders
        const giftCardsQuery = `
          SELECT 
            gc.*,
            uo.purchase_date as fecha_compra,
            uo.status as purchase_status
          FROM user_orders uo
          JOIN orders o ON uo.order_id = o.id
          JOIN gift_cards gc ON o.id = gc.order_id
          WHERE uo.user_id = ?
          ORDER BY gc.fecha_creacion DESC
        `;
        const [rows] = await connection.execute(giftCardsQuery, [userId]);
        results = rows;
      }
    } finally {
      connection.release();
    }

    return Response.json({
      success: true,
      data: results,
      message: `${type === 'orders' ? 'Órdenes' : 'Gift cards'} obtenidas exitosamente`
    });

  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    return Response.json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    }, { status: 500 });
  }
}