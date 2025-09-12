import pool from '@/utils/db';

// Función para generar contraseña temporal
function generateTempPassword(length = 8) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// GET - Obtener todos los beneficiarios
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();
    
    try {
      // Obtener beneficiarios con información de usuarios asociados
      const [beneficiarios] = await connection.query(`
        SELECT 
          b.*,
          u.id as user_id,
          u.estado as user_status,
          u.ultimo_login,
          o.numero_orden,
          o.empresa
        FROM beneficiarios b
        LEFT JOIN usuarios u ON b.email = u.gmail
        LEFT JOIN orders o ON b.order_id = o.id
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      // Contar total
      const [countResult] = await connection.query('SELECT COUNT(*) as total FROM beneficiarios');
      const total = countResult[0].total;

      return Response.json({
        success: true,
        data: beneficiarios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching beneficiarios:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// POST - Crear nuevo beneficiario (y usuario automáticamente)
export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, order_id } = body;

    if (!nombre || !email) {
      return Response.json({
        success: false,
        message: 'Nombre y email son requeridos'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verificar si ya existe el beneficiario
      const [existingBen] = await connection.query(
        'SELECT id FROM beneficiarios WHERE email = ?',
        [email]
      );

      if (existingBen.length > 0) {
        await connection.rollback();
        return Response.json({
          success: false,
          message: 'Ya existe un beneficiario con ese email'
        }, { status: 409 });
      }

      // Generar contraseña temporal
      const tempPassword = generateTempPassword(8);
      const tempExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // Crear beneficiario
      const [benResult] = await connection.query(`
        INSERT INTO beneficiarios (nombre, email, temp_password, must_change_password, temp_password_expires, estado, order_id, created_at) 
        VALUES (?, ?, ?, 1, ?, 1, ?, NOW())
      `, [nombre, email, tempPassword, tempExpires, order_id]);

      // ✅ Crear usuario automáticamente
      const userName = email.split('@')[0]; // Usar parte antes del @ como usuario
      
      // Verificar si ya existe usuario con ese email o nombre de usuario
      const [existingUser] = await connection.query(
        'SELECT id FROM usuarios WHERE gmail = ? OR usuario = ?',
        [email, userName]
      );

      if (existingUser.length === 0) {
        await connection.query(`
          INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion, fecha_registro) 
          VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())
        `, [nombre, userName, email, tempPassword]);
        
        console.log(`✅ Usuario creado automáticamente: ${userName}`);
      }

      await connection.commit();

      return Response.json({
        success: true,
        message: 'Beneficiario y usuario creados exitosamente',
        data: {
          beneficiario_id: benResult.insertId,
          temp_password: tempPassword,
          usuario_creado: existingUser.length === 0
        }
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating beneficiario:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// PUT - Actualizar beneficiario
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nombre, email, estado, reset_password } = body;

    if (!id) {
      return Response.json({
        success: false,
        message: 'ID de beneficiario requerido'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Construir query de actualización
      let updateFields = [];
      let updateValues = [];

      if (nombre !== undefined) {
        updateFields.push('nombre = ?');
        updateValues.push(nombre);
      }

      if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }

      if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateValues.push(estado);
      }

      // Si se solicita reset de contraseña
      if (reset_password) {
        const newTempPassword = generateTempPassword(8);
        const tempExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        updateFields.push('temp_password = ?');
        updateFields.push('must_change_password = 1');
        updateFields.push('temp_password_expires = ?');
        
        updateValues.push(newTempPassword);
        updateValues.push(tempExpires);

        // También actualizar el usuario asociado
        await connection.query(
          'UPDATE usuarios SET password = ? WHERE gmail = ?',
          [newTempPassword, email]
        );
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await connection.query(
          `UPDATE beneficiarios SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      await connection.commit();

      return Response.json({
        success: true,
        message: 'Beneficiario actualizado exitosamente',
        new_password: reset_password ? updateValues[updateValues.length - 3] : null
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error updating beneficiario:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}