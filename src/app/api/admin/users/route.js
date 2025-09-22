import { NextResponse } from 'next/server';
import { pool } from '@/config/database';

// GET /api/admin/users
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, nombre, email, rol, estado FROM users ORDER BY id');
    client.release();

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users
export async function POST(request) {
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

    const { nombre, email, password, rol } = data;

    // Validar rol
    if (!['ADMIN', 'USER'].includes(rol)) {
      return NextResponse.json(
        { success: false, message: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Insertar nuevo usuario
    await client.query(
      'INSERT INTO users (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
      [nombre, email, password, rol]
    );

    client.release();
    return NextResponse.json({ 
      success: true, 
      message: 'Usuario creado correctamente' 
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}