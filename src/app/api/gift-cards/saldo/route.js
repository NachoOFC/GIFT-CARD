import pool from '@/utils/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    // Verificar que se proporcione al menos uno de los parámetros necesarios
    if (!codigo && !email && !userId) {
      return Response.json({ 
        success: false, 
        message: 'Se requiere código de gift card, email o userId' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Si se proporciona email, obtener todas las gift cards del usuario
      if (email && !codigo) {
        // Primero obtener el usuario por email
        const [userRows] = await connection.execute(
          'SELECT id, gmail as email FROM usuarios WHERE gmail = ?',
          [email]
        );

        if (userRows.length === 0) {
          return Response.json({
            success: true,
            saldoTotal: 0,
            giftCards: [],
            userStats: {
              totalSpent: 0,
              totalGiftCards: 0,
              activeGiftCards: 0
            },
            message: 'Usuario no encontrado o sin gift cards'
          });
        }

        const user = userRows[0];

        // Obtener todas las gift cards del usuario (solo las que PUEDE USAR: destinatario o compradas para sí mismo)
        const allGiftCardsQuery = `
          SELECT DISTINCT
            gc.*,
            o.fecha_orden,
            o.empresa,
            o.numero_orden,
            o.email_comprador,
            DATEDIFF(gc.fecha_expiracion, NOW()) as dias_restantes,
            CASE 
              WHEN gc.fecha_expiracion < NOW() THEN 'expirada'
              WHEN DATEDIFF(gc.fecha_expiracion, NOW()) <= 30 THEN 'proxima_expiracion'
              ELSE 'activa'
            END as estado_expiracion
          FROM gift_cards gc
          LEFT JOIN orders o ON gc.order_id = o.id
          WHERE gc.email_destinatario = ?
          ORDER BY gc.fecha_creacion DESC
        `;

        const [allGiftCards] = await connection.execute(allGiftCardsQuery, [email]);

        // Calcular saldo total
        const saldoTotal = allGiftCards.reduce((total, card) => {
          return total + (parseFloat(card.saldo_actual) || 0);
        }, 0);

        // Obtener estadísticas del usuario (solo contar gastos como comprador, no como beneficiario)
        const statsQuery = `
          SELECT 
            COALESCE(SUM(CASE WHEN uo.tipo IN ('comprador', 'comprador_beneficiario') THEN uo.total_amount ELSE 0 END), 0) as totalSpent,
            COUNT(*) as totalOrders
          FROM user_orders uo
          WHERE uo.user_id = ?
        `;

        const [statsRows] = await connection.execute(statsQuery, [user.id]);

        const userStats = statsRows[0] || {
          totalSpent: 0,
          totalOrders: 0
        };

        // Los puntos se calculan basado en el GASTO REAL como comprador (igual que en profile)
        const points = Math.floor((userStats.totalSpent || 0) / 1000);

        return Response.json({
          success: true,
          saldoTotal,
          giftCards: allGiftCards,
          userStats: {
            ...userStats,
            totalGiftCards: allGiftCards.length,
            activeGiftCards: allGiftCards.filter(card => card.activa).length,
            points: points
          },
          userInfo: user
        });
      }

      // Lógica original para consulta por código específico
      if (codigo) {
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
            const [userRows] = await connection.execute(
            'SELECT id, gmail as email, nombre FROM usuarios WHERE id = ?',
            [userId]
          );

          if (userRows.length > 0) {
            userInfo = userRows[0];

            // Obtener estadísticas del usuario
            const statsQuery = `
              SELECT 
                COALESCE(SUM(uo.total_amount), 0) as totalSpent,
                COUNT(*) as totalGiftCards,
                COUNT(CASE WHEN uo.status = 'active' THEN 1 END) as activeGiftCards
              FROM user_orders uo
              WHERE uo.user_id = ?
            `;

            const [statsRows] = await connection.execute(statsQuery, [userInfo.id]);
            userInfo.stats = statsRows[0] || {
              totalSpent: 0,
              totalGiftCards: 0,
              activeGiftCards: 0
            };
          }
        }

        return Response.json({
          success: true,
          giftCard,
          userInfo,
          verificationStatus: {
            canAccess: true,
            message: 'Acceso autorizado a la gift card'
          }
        });
      }

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