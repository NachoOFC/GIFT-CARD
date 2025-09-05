import pool from '@/utils/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Obtener todas las gift cards activas
      const [giftCards] = await connection.query(`
        SELECT 
          id,
          codigo,
          valor_inicial,
          saldo_actual,
          activa,
          fecha_creacion,
          fecha_expiracion,
          email_destinatario,
          mensaje,
          empresa,
          order_id
        FROM gift_cards 
        WHERE activa = 1
        ORDER BY fecha_creacion DESC
      `);

      return Response.json({
        success: true,
        data: giftCards,
        count: giftCards.length
      });

    } catch (err) {
      console.error('Error obteniendo gift cards:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint gift-cards:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}

// Manejar otros métodos HTTP
export async function POST() {
  return Response.json({
    success: false,
    message: 'Método no permitido'
  }, { status: 405 });
}
