import pool from '@/utils/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validar parámetros requeridos
    if (!email || !password) {
      return Response.json({
        success: false,
        message: 'Email y contraseña son requeridos'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      console.log('🔍 Buscando usuario con email:', email);
      
      // Buscar usuario por email (gmail) o por usuario
      const [users] = await connection.query(
        'SELECT id, nombre, usuario, gmail, password, perfil, estado FROM usuarios WHERE (gmail = ? OR usuario = ?)',
        [email, email]
      );

      console.log('👥 Usuarios encontrados:', users.length);
      console.log('📋 Datos de usuarios:', users);

      if (users.length === 0) {
        console.log('❌ No se encontró usuario');
        return Response.json({
          success: false,
          message: 'Usuario o contraseña incorrectos'
        }, { status: 401 });
      }

      const user = users[0];
      console.log('🔑 Password en BD:', user.password);
      console.log('🔑 Password enviado:', password);
      console.log('🔑 Coinciden:', user.password === password);

      // Verificar contraseña (comparación simple - en producción usar bcrypt)
      if (user.password !== password) {
        console.log('❌ Contraseña incorrecta');
        return Response.json({
          success: false,
          message: 'Usuario o contraseña incorrectos'
        }, { status: 401 });
      }

      // Actualizar último login
      await connection.query(
        'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
        [user.id]
      );

      // Devolver datos del usuario (sin contraseña)
      const { password: _, ...userData } = user;

      return Response.json({
        success: true,
        message: 'Login exitoso',
        data: userData
      });

    } catch (err) {
      console.error('Error en login:', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en endpoint de login:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return Response.json({
    success: false,
    message: 'Método no permitido'
  }, { status: 405 });
}
