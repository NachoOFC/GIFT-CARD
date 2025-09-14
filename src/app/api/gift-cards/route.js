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

// Función para generar código único
const generateUniqueCode = async (connection) => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = 'GC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Verificar si el código ya existe
    const [existing] = await connection.query(
      'SELECT id FROM gift_cards WHERE codigo = ?',
      [code]
    );
    
    if (existing.length === 0) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('No se pudo generar un código único');
};

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

// Crear nueva gift card
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      valor_inicial, 
      email_destinatario, 
      mensaje, 
      empresa = 'Sistema',
      vigencia_dias = 180 
    } = body;

    // Validaciones robustas
    if (!valor_inicial || typeof valor_inicial !== 'number' || valor_inicial <= 0) {
      return Response.json({
        success: false,
        message: 'El valor inicial es requerido y debe ser un número mayor a 0'
      }, { status: 400 });
    }

    if (!email_destinatario || typeof email_destinatario !== 'string') {
      return Response.json({
        success: false,
        message: 'Email del destinatario es requerido'
      }, { status: 400 });
    }

    const sanitizedEmail = sanitizeString(email_destinatario);
    if (!validateEmail(sanitizedEmail)) {
      return Response.json({
        success: false,
        message: 'Email del destinatario no tiene un formato válido'
      }, { status: 400 });
    }

    if (vigencia_dias && (typeof vigencia_dias !== 'number' || vigencia_dias < 1 || vigencia_dias > 365)) {
      return Response.json({
        success: false,
        message: 'La vigencia debe ser un número entre 1 y 365 días'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      // Generar código único
      const codigo = await generateUniqueCode(connection);
      
      // Calcular fechas
      const fecha_creacion = new Date();
      const fecha_expiracion = new Date();
      fecha_expiracion.setDate(fecha_creacion.getDate() + vigencia_dias);

      // Sanitizar datos
      const sanitizedMensaje = sanitizeString(mensaje);
      const sanitizedEmpresa = sanitizeString(empresa);

      // Insertar nueva gift card
      const [result] = await connection.query(`
        INSERT INTO gift_cards (
          codigo,
          valor_inicial,
          saldo_actual,
          activa,
          fecha_creacion,
          fecha_expiracion,
          email_destinatario,
          mensaje,
          empresa
        ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)
      `, [
        codigo,
        valor_inicial,
        valor_inicial, // saldo_actual inicialmente igual al valor_inicial
        fecha_creacion,
        fecha_expiracion,
        sanitizedEmail,
        sanitizedMensaje,
        sanitizedEmpresa
      ]);

      return Response.json({
        success: true,
        message: 'Gift card creada exitosamente',
        data: {
          id: result.insertId,
          codigo,
          valor_inicial,
          saldo_actual: valor_inicial,
          activa: 1,
          fecha_creacion,
          fecha_expiracion,
          email_destinatario: sanitizedEmail,
          mensaje: sanitizedMensaje,
          empresa: sanitizedEmpresa
        }
      });

    } catch (err) {
      console.error('Error creando gift card:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint POST gift-cards:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}