import db from '@/config/db';

export async function POST(request) {
  try {
    const { email, password, rut } = await request.json();

    if ((!email && !rut) || !password) {
      return Response.json({ success: false, message: 'RUT o email y contraseña son requeridos' }, { status: 400 });
    }

    // Buscar empresa por rut o email
    const empresas = await db.query(
      'SELECT id, nombre, rut, email, password, estado FROM empresas WHERE rut = ? OR email = ?',
      [rut || '', email || '']
    );

    if (empresas.length === 0) {
      return Response.json({ success: false, message: 'RUT/email o contraseña incorrectos' }, { status: 401 });
    }

    const empresa = empresas[0];
    if (empresa.password !== password) {
      return Response.json({ success: false, message: 'RUT/email o contraseña incorrectos' }, { status: 401 });
    }

    if (empresa.estado !== 1) {
      return Response.json({ success: false, message: 'La empresa está inactiva' }, { status: 403 });
    }

    // Devolver datos de la empresa (sin contraseña)
    const { password: _, ...empresaData } = empresa;
    return Response.json({ success: true, message: 'Login exitoso', data: empresaData });
  } catch (error) {
    console.error('Error en login empresa:', error);
    return Response.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
