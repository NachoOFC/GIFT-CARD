import { NextResponse } from 'next/server';
import { pool } from '@/config/database';

// GET /api/admin/parametros
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM parametros ORDER BY id');
    client.release();

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener parámetros:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener parámetros' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/parametros
export async function PUT(request) {
  try {
    const data = await request.json();
    const client = await pool.connect();

    // Validar que el usuario sea administrador
    const userEmail = request.headers.get('user-email');
    const adminCheck = await client.query(
      'SELECT check_admin_access($1) as is_admin',
      [userEmail]
    );

    if (!adminCheck.rows[0].is_admin) {
      client.release();
      return NextResponse.json(
        { success: false, message: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Actualizar parámetros
    for (const param of data) {
      await client.query(
        'UPDATE parametros SET valor = $1, updated_at = CURRENT_TIMESTAMP WHERE nombre = $2',
        [param.valor, param.nombre]
      );
    }

    // Ejecutar validaciones
    await client.query('SELECT validate_parametros()');

    client.release();
    return NextResponse.json({ success: true, message: 'Parámetros actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar parámetros:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error al actualizar parámetros' },
      { status: 500 }
    );
  }
}