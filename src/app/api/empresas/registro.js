import db from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
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
    password,
    empleados
  } = req.body;

  // Validación básica
  if (!nombre || !rut || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    // Verificar si ya existe empresa con ese rut o email
    const [existe] = await db.query(
      'SELECT id FROM empresas WHERE rut = ? OR email = ?',
      [rut, email]
    );
    if (existe.length > 0) {
      return res.status(409).json({ message: 'Ya existe una empresa con ese RUT o email' });
    }

    // Insertar empresa
    await db.query(
      `INSERT INTO empresas (nombre, rut, email, telefono, direccion, ciudad, region, pais, contacto_nombre, contacto_email, contacto_telefono, servicio_contacto, logo_url, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, rut, email, telefono, direccion, ciudad, region, pais, contacto_nombre, contacto_email, contacto_telefono, servicio_contacto, logo_url, password]
    );

    return res.status(201).json({ message: 'Empresa registrada correctamente' });
  } catch (err) {
    return res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
}
