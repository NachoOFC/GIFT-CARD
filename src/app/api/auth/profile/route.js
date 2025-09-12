import pool from '@/utils/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({
        success: false,
        message: 'ID de usuario requerido'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT id, nombre, usuario, gmail, telefono, direccion, fecha_nacimiento, fecha_registro, preferencias_notificacion, foto_url FROM usuarios WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return Response.json({
          success: false,
          message: 'Usuario no encontrado'
        }, { status: 404 });
      }

      return Response.json({
        success: true,
        data: users[0]
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id, 
      nombre, 
      usuario, 
      gmail, 
      telefono, 
      direccion, 
      fecha_nacimiento, 
      preferencias_notificacion,
      password, 
      newPassword,
      foto_url 
    } = body;

    if (!id) {
      return Response.json({
        success: false,
        message: 'ID de usuario requerido'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verificar que el usuario existe
      const [userCheck] = await connection.query(
        'SELECT id, password FROM usuarios WHERE id = ?',
        [id]
      );

      if (userCheck.length === 0) {
        await connection.rollback();
        return Response.json({
          success: false,
          message: 'Usuario no encontrado'
        }, { status: 404 });
      }

      // Si se quiere cambiar la contraseña, verificar la actual
      if (password && newPassword) {
        if (userCheck[0].password !== password) {
          await connection.rollback();
          return Response.json({
            success: false,
            message: 'Contraseña actual incorrecta'
          }, { status: 400 });
        }
      }

      // Preparar los datos a actualizar
      let updateFields = [];
      let updateValues = [];

      if (nombre !== undefined) {
        updateFields.push('nombre = ?');
        updateValues.push(nombre);
      }

      if (usuario !== undefined) {
        // Verificar que el usuario no esté en uso por otro
        const [existingUser] = await connection.query(
          'SELECT id FROM usuarios WHERE usuario = ? AND id != ?',
          [usuario, id]
        );

        if (existingUser.length > 0) {
          await connection.rollback();
          return Response.json({
            success: false,
            message: 'Este nombre de usuario ya está en uso'
          }, { status: 400 });
        }

        updateFields.push('usuario = ?');
        updateValues.push(usuario);
      }

      if (gmail !== undefined) {
        // Verificar que el email no esté en uso por otro
        if (gmail && gmail.trim() !== '') {
          const [existingEmail] = await connection.query(
            'SELECT id FROM usuarios WHERE gmail = ? AND id != ?',
            [gmail, id]
          );

          if (existingEmail.length > 0) {
            await connection.rollback();
            return Response.json({
              success: false,
              message: 'Este email ya está en uso'
            }, { status: 400 });
          }
        }

        updateFields.push('gmail = ?');
        updateValues.push(gmail || null);
      }

      if (telefono !== undefined) {
        updateFields.push('telefono = ?');
        updateValues.push(telefono || null);
      }

      if (direccion !== undefined) {
        updateFields.push('direccion = ?');
        updateValues.push(direccion || null);
      }

      if (fecha_nacimiento !== undefined) {
        updateFields.push('fecha_nacimiento = ?');
        updateValues.push(fecha_nacimiento || null);
      }

      if (preferencias_notificacion !== undefined) {
        updateFields.push('preferencias_notificacion = ?');
        updateValues.push(preferencias_notificacion ? 1 : 0);
      }

      if (foto_url !== undefined) {
        updateFields.push('foto_url = ?');
        updateValues.push(foto_url);
      }

      if (newPassword) {
        updateFields.push('password = ?');
        updateValues.push(newPassword);
      }

      if (updateFields.length === 0) {
        await connection.rollback();
        return Response.json({
          success: false,
          message: 'No hay campos para actualizar'
        }, { status: 400 });
      }

      // Agregar el ID del usuario al final
      updateValues.push(id);

      // Ejecutar la actualización
      const updateQuery = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
      await connection.execute(updateQuery, updateValues);

      // Obtener los datos actualizados del usuario
      const [updatedUser] = await connection.query(
        'SELECT id, nombre, usuario, gmail, telefono, direccion, fecha_nacimiento, preferencias_notificacion, foto_url, estado, fecha_registro FROM usuarios WHERE id = ?',
        [id]
      );

      await connection.commit();

      return Response.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        user: updatedUser[0]
      });

    } catch (err) {
      await connection.rollback();
      console.error('Error actualizando perfil:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint profile:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}