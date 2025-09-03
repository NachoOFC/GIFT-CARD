import pool from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Esperamos recibir los campos con nombres compatibles con la tabla `usuarios`:
    // { nombre, usuario, gmail, password, perfil?, foto?, estado? }
    const { nombre, usuario, gmail, password, perfil, foto, estado } = req.body;
    
    if (!usuario || !password) {
      return res.status(400).json({ success: false, message: 'usuario y password son requeridos' });
    }

    // Valores por defecto si no se envían
    const nombreToInsert = nombre && String(nombre).trim() !== '' ? String(nombre).trim() : (String(usuario).split('@')[0] || '');
    const perfilToInsert = perfil && String(perfil).trim() !== '' ? String(perfil).trim() : 'user';
    const fotoToInsert = foto && String(foto).trim() !== '' ? String(foto).trim() : '';
    const estadoToInsert = typeof estado !== 'undefined' && estado !== null ? estado : 1; // 1 = activo
    const gmailToInsert = gmail && String(gmail).trim() !== '' ? String(gmail).trim() : null;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar si ya existe el usuario en la tabla `usuarios` (columna `usuario`)
      const [existing] = await connection.query('SELECT COUNT(*) as count FROM usuarios WHERE usuario = ?', [usuario]);
      if (existing[0].count > 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Usuario ya registrado' });
      }

      // Insertar nuevo usuario en la tabla `usuarios`.
      // Columnas: id, nombre, usuario, gmail, password, perfil, foto, estado, ultimo_login, fecha
      const [result] = await connection.execute(
        'INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, foto, estado, ultimo_login, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [nombreToInsert, usuario, gmailToInsert, password, perfilToInsert, fotoToInsert, estadoToInsert]
      );

      await connection.commit();

      return res.status(201).json({ 
        success: true, 
        message: 'Usuario registrado exitosamente', 
        data: { id: result.insertId, usuario } 
      });
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
      return res.status(500).json({ success: false, message: error.message, stack: error.stack });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
