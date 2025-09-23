import pool from '@/utils/db';
import crypto from 'crypto';

// Función para generar ID de transacción único
const generateTransactionId = () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `TX-${today}-${random}`;
};

// Función para generar clave de idempotencia si no se proporciona
const generateIdempotencyKey = (giftcardCode, amount, userId) => {
  const data = `${giftcardCode}-${amount}-${userId}-${Date.now()}`;
  return `IDEM-${crypto.createHash('md5').update(data).digest('hex')}`;
};

// Función para validar entrada
const validateRedeemRequest = (body) => {
  const errors = [];
  
  if (!body.giftcard_codigo || typeof body.giftcard_codigo !== 'string') {
    errors.push('Código de gift card es requerido');
  }
  
  if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('Monto debe ser un número positivo');
  }
  
  if (body.amount && body.amount > 1000000) {
    errors.push('Monto máximo permitido es $1,000,000');
  }
  
  return errors;
};

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * POST /api/giftcards/redeem
 * Procesa el canje parcial de una Gift Card
 * 
 * Body esperado:
 * {
 *   "giftcard_codigo": "ABC123XYZ",
 *   "amount": 5000,
 *   "idempotency_key": "opcional-uuid",
 *   "description": "Descripción opcional del canje"
 * }
 */
export async function POST(request) {
  let connection;
  
  try {
    const body = await request.json();
    console.log('🎁 Solicitud de canje recibida:', body);
    
    // Validar entrada
    const errors = validateRedeemRequest(body);
    if (errors.length > 0) {
      return Response.json({
        success: false,
        message: 'Datos inválidos',
        errors
      }, { status: 400 });
    }
    
    const { 
      giftcard_codigo, 
      amount, 
      description = 'Canje parcial de Gift Card',
      idempotency_key = null
    } = body;
    
    // Obtener información del usuario (si está autenticado)
    let userId = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        // Aquí puedes implementar tu lógica de autenticación
        // Por ahora, asumimos que viene en el body o header
      }
    } catch {
      console.log('Usuario no autenticado, continuando sin userId');
    }
    
    // Generar clave de idempotencia si no se proporciona
    const finalIdempotencyKey = idempotency_key || generateIdempotencyKey(
      giftcard_codigo, 
      amount, 
      userId || 'anonymous'
    );
    
    connection = await pool.getConnection();
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    try {
      // 1. Verificar si ya existe la transacción (idempotencia)
      const [existingTransaction] = await connection.execute(`
        SELECT transaction_id, amount, balance_after, created_at
        FROM gift_card_transactions 
        WHERE idempotency_key = ?
      `, [finalIdempotencyKey]);
      
      if (existingTransaction.length > 0) {
        const existing = existingTransaction[0];
        console.log('🔄 Transacción duplicada detectada:', existing.transaction_id);
        
        await connection.commit();
        
        return Response.json({
          success: true,
          message: 'Transacción ya procesada anteriormente',
          data: {
            transaction_id: existing.transaction_id,
            amount: existing.amount,
            balance_after: existing.balance_after,
            created_at: existing.created_at,
            duplicate: true
          }
        });
      }
      
      // 2. Obtener y bloquear la gift card para actualización
      const [giftCards] = await connection.execute(`
        SELECT 
          id, codigo, valor_inicial, saldo_actual, 
          email_destinatario, fecha_expiracion, activa
        FROM gift_cards 
        WHERE codigo = ? AND activa = 1
        FOR UPDATE
      `, [giftcard_codigo]);
      
      if (giftCards.length === 0) {
        await connection.rollback();
        return Response.json({
          success: false,
          message: 'Gift card no encontrada o inactiva'
        }, { status: 404 });
      }
      
      const giftCard = giftCards[0];
      
      // 3. Validar fecha de expiración
      const today = new Date();
      const expirationDate = new Date(giftCard.fecha_expiracion);
      
      if (expirationDate < today) {
        await connection.rollback();
        return Response.json({
          success: false,
          message: 'Gift card expirada'
        }, { status: 400 });
      }
      
      // 4. Validar saldo suficiente
      if (giftCard.saldo_actual < amount) {
        await connection.rollback();
        return Response.json({
          success: false,
          message: `Saldo insuficiente. Disponible: ${formatCurrency(giftCard.saldo_actual)}`,
          data: {
            available_balance: giftCard.saldo_actual,
            requested_amount: amount
          }
        }, { status: 400 });
      }
      
      // 5. Calcular nuevo saldo
      const balanceBefore = giftCard.saldo_actual;
      const balanceAfter = balanceBefore - amount;
      
      // 6. Generar ID de transacción único
      const transactionId = generateTransactionId();
      
      // 7. Obtener userId si el email coincide con un usuario registrado
      if (!userId && giftCard.email_destinatario) {
        const [users] = await connection.execute(`
          SELECT id FROM usuarios WHERE gmail = ?
        `, [giftCard.email_destinatario]);
        
        if (users.length > 0) {
          userId = users[0].id;
        }
      }
      
      // 8. Crear registro de transacción
      await connection.execute(`
        INSERT INTO gift_card_transactions (
          transaction_id, giftcard_codigo, giftcard_id, user_id,
          amount, balance_before, balance_after, transaction_type,
          status, idempotency_key, description, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'redeem', 'completed', ?, ?, ?)
      `, [
        transactionId,
        giftCard.codigo,
        giftCard.id,
        userId,
        amount,
        balanceBefore,
        balanceAfter,
        finalIdempotencyKey,
        description,
        JSON.stringify({
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
          location: 'Chile'
        })
      ]);
      
      // 9. Actualizar saldo de la gift card
      await connection.execute(`
        UPDATE gift_cards 
        SET saldo_actual = ? 
        WHERE id = ?
      `, [balanceAfter, giftCard.id]);
      
      // 10. Confirmar transacción
      await connection.commit();
      
      console.log(`✅ Canje exitoso: ${transactionId} - ${formatCurrency(amount)}`);
      
      // 11. Preparar respuesta exitosa
      const responseData = {
        transaction_id: transactionId,
        giftcard_codigo: giftCard.codigo,
        amount: amount,
        amount_formatted: formatCurrency(amount),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        balance_after_formatted: formatCurrency(balanceAfter),
        email_destinatario: giftCard.email_destinatario,
        description: description,
        created_at: new Date().toISOString(),
        qr_data: {
          transaction_id: transactionId,
          amount: amount,
          balance_after: balanceAfter,
          date: new Date().toISOString().split('T')[0]
        }
      };
      
      return Response.json({
        success: true,
        message: `Canje realizado exitosamente por ${formatCurrency(amount)}`,
        data: responseData
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error en endpoint de canje:', error);
    
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
    
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * GET /api/giftcards/redeem?transaction_id=TX-20250923-123456
 * Obtiene detalles de una transacción de canje
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');
    
    if (!transactionId) {
      return Response.json({
        success: false,
        message: 'ID de transacción requerido'
      }, { status: 400 });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [transactions] = await connection.execute(`
        SELECT 
          gct.*,
          gc.valor_inicial,
          gc.email_destinatario,
          gc.fecha_expiracion,
          u.nombre as user_name,
          u.gmail as user_email
        FROM gift_card_transactions gct
        JOIN gift_cards gc ON gct.giftcard_id = gc.id
        LEFT JOIN usuarios u ON gct.user_id = u.id
        WHERE gct.transaction_id = ?
      `, [transactionId]);
      
      if (transactions.length === 0) {
        return Response.json({
          success: false,
          message: 'Transacción no encontrada'
        }, { status: 404 });
      }
      
      const transaction = transactions[0];
      
      return Response.json({
        success: true,
        data: {
          transaction_id: transaction.transaction_id,
          giftcard_codigo: transaction.giftcard_codigo,
          amount: transaction.amount,
          amount_formatted: formatCurrency(transaction.amount),
          balance_before: transaction.balance_before,
          balance_after: transaction.balance_after,
          balance_after_formatted: formatCurrency(transaction.balance_after),
          transaction_type: transaction.transaction_type,
          status: transaction.status,
          description: transaction.description,
          created_at: transaction.created_at,
          email_destinatario: transaction.email_destinatario,
          user_name: transaction.user_name,
          metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null
        }
      });
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo transacción:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}