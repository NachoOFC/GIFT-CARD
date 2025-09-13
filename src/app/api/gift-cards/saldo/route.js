import pool from '@/utils/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    const userId = searchParams.get('userId');

    if (!codigo) {
      return Response.json({ 
        success: false, 
        message: 'Código de gift card requerido' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Obtener información completa de la gift card
      const giftCardQuery = `
        SELECT 
          gc.*,
          o.fecha_orden,
          o.empresa,
          o.numero_orden,
          DATEDIFF(gc.fecha_expiracion, NOW()) as dias_restantes,
          CASE 
            WHEN gc.fecha_expiracion < NOW() THEN 'expirada'
            WHEN DATEDIFF(gc.fecha_expiracion, NOW()) <= 30 THEN 'proxima_expiracion'
            ELSE 'activa'
          END as estado_expiracion
        FROM gift_cards gc
        LEFT JOIN orders o ON gc.order_id = o.id
        WHERE gc.codigo = ?
      `;

      const [giftCardRows] = await connection.execute(giftCardQuery, [codigo]);

      if (giftCardRows.length === 0) {
        return Response.json({
          success: false,
          message: 'Gift card no encontrada'
        }, { status: 404 });
      }

      const giftCard = giftCardRows[0];

      // Si se proporciona userId, obtener información del usuario y sus estadísticas
      let userInfo = null;
      if (userId) {
        const userQuery = `
          SELECT 
            u.nombre,
            u.gmail,
            u.fecha_registro,
            u.perfil
          FROM usuarios u
          WHERE u.id = ?
        `;
        const [userRows] = await connection.execute(userQuery, [userId]);

        if (userRows.length > 0) {
          const user = userRows[0];

          // Calcular estadísticas del usuario
          const statsQuery = `
            SELECT 
              SUM(CASE 
                WHEN uo.tipo IN ('comprador', 'comprador_beneficiario') 
                THEN uo.total_amount 
                ELSE 0 
              END) as total_gastado,
              COUNT(CASE WHEN uo.gift_card_codes IS NOT NULL THEN 1 END) as total_gift_cards,
              COUNT(CASE WHEN uo.tipo IN ('comprador', 'comprador_beneficiario') THEN 1 END) as total_compras
            FROM user_orders uo
            WHERE uo.user_id = ?
          `;
          const [statsRows] = await connection.execute(statsQuery, [userId]);
          const stats = statsRows[0] || { total_gastado: 0, total_gift_cards: 0, total_compras: 0 };

          userInfo = {
            ...user,
            estadisticas: {
              totalGastado: stats.total_gastado || 0,
              totalGiftCards: stats.total_gift_cards || 0,
              totalCompras: stats.total_compras || 0,
              puntosAcumulados: Math.floor((stats.total_gastado || 0) / 1000)
            }
          };
        }
      }

      // Verificar si el usuario tiene acceso a esta gift card
      let tieneAcceso = false;
      let tipoAcceso = '';
      if (userId) {
        const accessQuery = `
          SELECT uo.tipo
          FROM user_orders uo
          WHERE uo.user_id = ? 
          AND uo.gift_card_codes LIKE ?
        `;
        const [accessRows] = await connection.execute(accessQuery, [userId, `%${codigo}%`]);
        
        if (accessRows.length > 0) {
          tieneAcceso = true;
          tipoAcceso = accessRows[0].tipo;
        }
      }

      // Historial de transacciones (si implementamos uso de gift cards en el futuro)
      const transactionHistory = [];

      return Response.json({
        success: true,
        data: {
          giftCard: {
            codigo: giftCard.codigo,
            valor_inicial: giftCard.valor_inicial,
            saldo_actual: giftCard.saldo_actual,
            activa: giftCard.activa,
            fecha_creacion: giftCard.fecha_creacion,
            fecha_expiracion: giftCard.fecha_expiracion,
            email_destinatario: giftCard.email_destinatario,
            empresa: giftCard.empresa,
            mensaje: giftCard.mensaje,
            numero_orden: giftCard.numero_orden,
            dias_restantes: giftCard.dias_restantes,
            estado_expiracion: giftCard.estado_expiracion,
            porcentaje_usado: Math.round(((giftCard.valor_inicial - giftCard.saldo_actual) / giftCard.valor_inicial) * 100)
          },
          usuario: userInfo,
          acceso: {
            tieneAcceso,
            tipoAcceso
          },
          historial: transactionHistory
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en consulta de saldo:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}