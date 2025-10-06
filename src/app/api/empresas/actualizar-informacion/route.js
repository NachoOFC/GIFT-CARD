import { NextResponse } from 'next/server';
import db from '@/config/db';

export async function POST(request) {
  try {
    const { empresaId, informacion } = await request.json();

    if (!empresaId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de empresa requerido' 
      }, { status: 400 });
    }

    // Validaciones
    if (!informacion.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email es requerido' 
      }, { status: 400 });
    }

    // Actualizar información de la empresa
    const query = `
      UPDATE empresas 
      SET 
        direccion = ?,
        ciudad = ?,
        region = ?,
        pais = ?,
        telefono = ?,
        email = ?,
        contacto_nombre = ?,
        contacto_email = ?
      WHERE id = ?
    `;

    await db.query(query, [
      informacion.direccion || null,
      informacion.ciudad,
      informacion.region,
      informacion.pais || 'Chile',
      informacion.telefono || null,
      informacion.email,
      informacion.contacto_nombre || null,
      informacion.contacto_email || null,
      empresaId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Información actualizada correctamente',
      data: informacion
    });

  } catch (error) {
    console.error('Error al actualizar información:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al actualizar información',
      error: error.message
    }, { status: 500 });
  }
}
