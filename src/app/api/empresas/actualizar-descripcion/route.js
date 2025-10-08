import { NextResponse } from 'next/server';
import db from '@/config/db';

export async function POST(request) {
  try {
    const { empresaId, nombre, descripcion, logo_partners } = await request.json();

    if (!empresaId || !nombre || !descripcion) {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Si se proporciona logo_partners, actualizarlo también
    if (logo_partners) {
      await db.query(
        'UPDATE empresas SET nombre = ?, slogan = ?, logo_partners = ? WHERE id = ?',
        [nombre, descripcion, logo_partners, empresaId]
      );
    } else {
      await db.query(
        'UPDATE empresas SET nombre = ?, slogan = ? WHERE id = ?',
        [nombre, descripcion, empresaId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Información actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar descripción:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar la descripción' },
      { status: 500 }
    );
  }
}
