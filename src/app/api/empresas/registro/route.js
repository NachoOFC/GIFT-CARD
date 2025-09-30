import db from '../../../../config/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nombre,
      rut,
      email,
      telefono,
      direccion,
      ciudad,
      region,
      pais,
      contacto_nombre,
      contacto_email,
      contacto_telefono,
      servicio_contacto,
      logo_url,
      password
    } = body;

    if (!nombre || !rut || !email || !password) {
      return Response.json({ message: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // Verificar si ya existe empresa con ese rut o email
        const existe = await db.query(
          'SELECT id, rut, email FROM empresas WHERE rut = ? OR email = ?',
          [rut, email]
        );
        if (existe.length > 0) {
          let conflicto = '';
          if (existe[0].rut === rut) conflicto = `RUT (${rut})`;
          if (existe[0].email === email) conflicto = conflicto ? `${conflicto} y Email (${email})` : `Email (${email})`;
          return Response.json({ message: `Ya existe una empresa con ese ${conflicto}` }, { status: 409 });
        }

    // Insertar empresa
    await db.query(
      `INSERT INTO empresas (nombre, rut, email, telefono, direccion, ciudad, region, pais, contacto_nombre, contacto_email, contacto_telefono, servicio_contacto, logo_url, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, rut, email, telefono || null, direccion || null, ciudad || null, region || null, pais || 'Chile', contacto_nombre || null, contacto_email || null, contacto_telefono || null, servicio_contacto || null, logo_url || null, password]
    );

    return Response.json({ message: 'Empresa registrada correctamente' }, { status: 201 });
  } catch (err) {
    console.error('Error registro empresa:', err);
    return Response.json({ message: 'Error en el servidor', error: err.message }, { status: 500 });
  }
}
