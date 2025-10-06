import db from '@/config/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('id');

    if (!empresaId) {
      return Response.json({ success: false, message: 'ID de empresa es requerido' }, { status: 400 });
    }

    // Obtener datos completos de la empresa
    const empresas = await db.query(
      `SELECT 
        id, 
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
        fecha_registro,
        estado
      FROM empresas 
      WHERE id = ? AND estado = 1`,
      [empresaId]
    );

    if (empresas.length === 0) {
      return Response.json({ success: false, message: 'Empresa no encontrada' }, { status: 404 });
    }

    const empresa = empresas[0];

    // Obtener estadísticas adicionales (opcional)
    // Por ejemplo: número de gift cards emitidas, seguidores, etc.
    const estadisticas = {
      visitasDelPerfil: 0,
      impresionesGiftCards: 0,
      seguidores: 0
    };

    return Response.json({ 
      success: true, 
      data: {
        ...empresa,
        estadisticas
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil de empresa:', error);
    return Response.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
