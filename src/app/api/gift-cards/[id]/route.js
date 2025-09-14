import pool from '@/utils/db';

// Función para validar email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para sanitizar strings
const sanitizeString = (str) => {
  return str ? str.trim().replace(/[<>]/g, '') : '';
};

// Obtener gift card por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return Response.json({
        success: false,
        message: 'ID de gift card inválido'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
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
        WHERE id = ? AND activa = 1
      `, [id]);

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
    console.error('Error en endpoint GET gift-card:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}

// Actualizar gift card
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      codigo,
      valor_inicial, 
      saldo_actual,
      email_destinatario, 
      mensaje,
      activa
    } = body;

    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return Response.json({
        success: false,
        message: 'ID de gift card inválido'
      }, { status: 400 });
    }

    // Validaciones
    if (codigo && typeof codigo !== 'string') {
      return Response.json({
        success: false,
        message: 'El código debe ser una cadena de texto'
      }, { status: 400 });
    }

    if (valor_inicial !== undefined && (typeof valor_inicial !== 'number' || valor_inicial < 0)) {
      return Response.json({
        success: false,
        message: 'El valor inicial debe ser un número mayor o igual a 0'
      }, { status: 400 });
    }

    if (saldo_actual !== undefined && (typeof saldo_actual !== 'number' || saldo_actual < 0)) {
      return Response.json({
        success: false,
        message: 'El saldo actual debe ser un número mayor o igual a 0'
      }, { status: 400 });
    }

    if (email_destinatario && typeof email_destinatario === 'string') {
      const sanitizedEmail = sanitizeString(email_destinatario);
      if (sanitizedEmail && !validateEmail(sanitizedEmail)) {
        return Response.json({
          success: false,
          message: 'Email del destinatario no tiene un formato válido'
        }, { status: 400 });
      }
    }

    if (activa !== undefined && typeof activa !== 'boolean' && activa !== 0 && activa !== 1) {
      return Response.json({
        success: false,
        message: 'El estado activo debe ser verdadero o falso'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      // Verificar que la gift card existe
      const [existing] = await connection.query(`
        SELECT id FROM gift_cards WHERE id = ? AND activa = 1
      `, [id]);

      if (existing.length === 0) {
        return Response.json({
          success: false,
          message: 'Gift card no encontrada'
        }, { status: 404 });
      }

      // Sanitizar datos
      const sanitizedCodigo = codigo ? sanitizeString(codigo) : undefined;
      const sanitizedEmail = email_destinatario ? sanitizeString(email_destinatario) : undefined;
      const sanitizedMensaje = mensaje ? sanitizeString(mensaje) : undefined;

      // Construir query dinámico
      const updateFields = [];
      const updateValues = [];

      if (sanitizedCodigo !== undefined) {
        updateFields.push('codigo = ?');
        updateValues.push(sanitizedCodigo);
      }
      if (valor_inicial !== undefined) {
        updateFields.push('valor_inicial = ?');
        updateValues.push(valor_inicial);
      }
      if (saldo_actual !== undefined) {
        updateFields.push('saldo_actual = ?');
        updateValues.push(saldo_actual);
      }
      if (sanitizedEmail !== undefined) {
        updateFields.push('email_destinatario = ?');
        updateValues.push(sanitizedEmail);
      }
      if (sanitizedMensaje !== undefined) {
        updateFields.push('mensaje = ?');
        updateValues.push(sanitizedMensaje);
      }
      if (activa !== undefined) {
        updateFields.push('activa = ?');
        updateValues.push(activa);
      }

      if (updateFields.length === 0) {
        return Response.json({
          success: false,
          message: 'No hay campos para actualizar'
        }, { status: 400 });
      }

      updateValues.push(id);

      // Actualizar gift card
      await connection.query(`
        UPDATE gift_cards SET
          ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return Response.json({
        success: true,
        message: 'Gift card actualizada exitosamente'
      });

    } catch (err) {
      console.error('Error actualizando gift card:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint PUT gift-card:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}

// Eliminar gift card (marcar como inactiva)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return Response.json({
        success: false,
        message: 'ID de gift card inválido'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      // Verificar que la gift card existe
      const [existing] = await connection.query(`
        SELECT id, codigo FROM gift_cards WHERE id = ? AND activa = 1
      `, [id]);

      if (existing.length === 0) {
        return Response.json({
          success: false,
          message: 'Gift card no encontrada'
        }, { status: 404 });
      }

      // Marcar como inactiva (soft delete)
      await connection.query(`
        UPDATE gift_cards SET activa = 0 WHERE id = ?
      `, [id]);

      return Response.json({
        success: true,
        message: `Gift card ${existing[0].codigo} eliminada exitosamente`
      });

    } catch (err) {
      console.error('Error eliminando gift card:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint DELETE gift-card:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}