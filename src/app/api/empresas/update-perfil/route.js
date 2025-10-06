import db from '@/config/db';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { empresaId, logo_url, portada_url } = body;

    if (!empresaId) {
      return NextResponse.json(
        { success: false, message: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    const updateFields = [];
    const updateValues = [];

    if (logo_url !== undefined) {
      updateFields.push('logo_url = ?');
      updateValues.push(logo_url);
    }

    if (portada_url !== undefined) {
      updateFields.push('portada_url = ?');
      updateValues.push(portada_url);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    updateValues.push(empresaId);

    const query = `UPDATE empresas SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(query, updateValues);

    // Obtener datos actualizados
    const [empresaActualizada] = await db.query(
      'SELECT id, nombre, logo_url, portada_url FROM empresas WHERE id = ?',
      [empresaId]
    );

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: empresaActualizada[0]
    });

  } catch (error) {
    console.error('Error actualizando perfil empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: error.message },
      { status: 500 }
    );
  }
}
