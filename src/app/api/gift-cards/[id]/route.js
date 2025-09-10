import pool from '../../../../utils/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { codigo, valor_inicial, saldo_actual, email_destinatario, mensaje } = body;

    const connection = await pool.getConnection();
    
    try {
      await connection.execute(
        `UPDATE gift_cards 
         SET codigo = ?, valor_inicial = ?, saldo_actual = ?, 
             email_destinatario = ?, mensaje = ?
         WHERE id = ?`,
        [codigo, valor_inicial, saldo_actual, email_destinatario, mensaje, id]
      );

      return Response.json({
        success: true,
        message: 'Gift card actualizada correctamente'
      });

    } catch (err) {
      console.error('Error actualizando gift card:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint PUT gift-cards:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const connection = await pool.getConnection();
    
    try {
      const [giftCards] = await connection.query(
        'SELECT * FROM gift_cards WHERE id = ?',
        [id]
      );

      if (giftCards.length === 0) {
        return Response.json({
          success: false,
          message: 'Gift card no encontrada'
        }, { status: 404 });
      }

      return Response.json({
        success: true,
        data: giftCards[0]
      });

    } catch (err) {
      console.error('Error obteniendo gift card:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint GET gift-cards:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}
