import { NextResponse } from 'next/server';
import db from '@/config/db';

export async function GET() {
  try {
    console.log('📋 Obteniendo lista de empresas...');
    
    const query = `
      SELECT 
        id,
        nombre,
        COALESCE(logo_partners, logo_url) as logo_url,
        slogan,
        ciudad,
        pais,
        fecha_registro
      FROM empresas 
      ORDER BY fecha_registro DESC
      LIMIT 50
    `;

    const empresas = await db.query(query);
    
    console.log(`✅ Se encontraron ${empresas.length} empresas`);

    return NextResponse.json({
      success: true,
      data: empresas || []
    });

  } catch (error) {
    console.error('❌ Error al obtener lista de empresas:', error);
    console.error('Detalles del error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al obtener empresas',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
