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
        // Obtener órdenes del usuario a través de user_orders (con información de tipo)
        const ordersQuery = `
          SELECT 
            o.*,
            uo.gift_card_codes,
            uo.total_amount,
            uo.purchase_date,
            uo.status as order_status,
            uo.tipo as user_role,
            CASE 
              WHEN uo.tipo = 'comprador' THEN 'Compra realizada'
              WHEN uo.tipo = 'beneficiario' THEN 'Gift card recibida'
              WHEN uo.tipo = 'comprador_beneficiario' THEN 'Compra propia'
              ELSE 'Sin especificar'
            END as role_description,
            CASE 
              WHEN uo.gift_card_codes IS NOT NULL THEN 'Con Gift Card'
              ELSE 'Solo historial'
            END as has_gift_card
          FROM user_orders uo
          JOIN orders o ON uo.order_id = o.id
          WHERE uo.user_id = ?
          ORDER BY uo.purchase_date DESC
        `;
        const [rows] = await connection.execute(ordersQuery, [userId]);
        results = rows;
      } else {
        // Obtener SOLO gift cards del usuario (donde tiene gift_card_codes)
        const giftCardsQuery = `
          SELECT 
            gc.*,
            uo.purchase_date as fecha_compra,
            uo.status as purchase_status,
            uo.tipo as user_role,
            o.numero_orden,
            o.email_comprador,
            o.nombre_comprador,
            CASE 
              WHEN uo.tipo = 'beneficiario' THEN 'Recibida de ' || o.nombre_comprador
              WHEN uo.tipo = 'comprador_beneficiario' THEN 'Compra propia'
              ELSE 'Gift card disponible'
            END as gift_card_source
          FROM user_orders uo
          JOIN orders o ON uo.order_id = o.id
          JOIN gift_cards gc ON o.id = gc.order_id
          WHERE uo.user_id = ? AND uo.gift_card_codes IS NOT NULL
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