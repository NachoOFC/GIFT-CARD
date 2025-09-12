import pool from '@/utils/db';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Esperamos recibir los campos con nombres compatibles con la tabla `usuarios`:
    // { nombre, usuario, password, perfil?, estado? }
    const { nombre, usuario, password, perfil, estado } = body;
    
    if (!usuario || !password) {
      return Response.json(
        { success: false, message: 'usuario y password son requeridos' },
        { status: 400 }
      );
    }

    // Valores por defecto si no se envían
    const nombreToInsert = nombre && String(nombre).trim() !== '' ? String(nombre).trim() : (String(usuario).split('@')[0] || '');
    const perfilToInsert = perfil && String(perfil).trim() !== '' ? String(perfil).trim() : 'user';
    const estadoToInsert = typeof estado !== 'undefined' && estado !== null ? estado : 1; // 1 = activo

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar si ya existe el usuario en la tabla `usuarios` (columna `usuario`)
      const [existing] = await connection.query('SELECT COUNT(*) as count FROM usuarios WHERE usuario = ?', [usuario]);
      if (existing[0].count > 0) {
        await connection.rollback();
        return Response.json(
          { success: false, message: 'Usuario ya registrado' },
          { status: 400 }
        );
      }

      // Insertar nuevo usuario en la tabla `usuarios`.
      // Columnas: id, nombre, usuario, password, perfil, estado, ultimo_login, fecha_creacion
      const [result] = await connection.execute(
        'INSERT INTO usuarios (nombre, usuario, password, perfil, estado, ultimo_login, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [nombreToInsert, usuario, password, perfilToInsert, estadoToInsert]
      );

      await connection.commit();

      return Response.json(
        { 
          success: true, 
          message: 'Usuario registrado exitosamente', 
          data: { id: result.insertId, usuario } 
        },
        { status: 201 }
      );
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error registrando usuario:', error);
    // En desarrollo devolver más detalles para depuración
    if (process.env.NODE_ENV !== 'production') {
      return Response.json(
        { success: false, message: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return Response.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
