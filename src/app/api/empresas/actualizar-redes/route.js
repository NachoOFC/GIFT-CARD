import { NextResponse } from 'next/server';
import db from '@/config/db';

export async function POST(request) {
  try {
    const { empresaId, redes } = await request.json();

    if (!empresaId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de empresa requerido' 
      }, { status: 400 });
    }

    // Actualizar redes sociales en la base de datos
    const query = `
      UPDATE empresas 
      SET 
        sitio_web = ?,
        facebook = ?,
        instagram = ?,
        twitter = ?,
        linkedin = ?,
        youtube = ?,
        tiktok = ?
      WHERE id = ?
    `;

    await db.query(query, [
      redes.sitio_web || null,
      redes.facebook || null,
      redes.instagram || null,
      redes.twitter || null,
      redes.linkedin || null,
      redes.youtube || null,
      redes.tiktok || null,
      empresaId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Redes sociales actualizadas correctamente',
      data: redes
    });

  } catch (error) {
    console.error('Error al actualizar redes sociales:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al actualizar redes sociales',
      error: error.message
    }, { status: 500 });
  }
}
