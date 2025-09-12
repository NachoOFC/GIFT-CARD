import pool from '@/utils/db';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Aquí podrías guardar los parámetros en una tabla de configuración
    // Por ahora solo devolvemos éxito
    console.log('Parámetros recibidos:', body);
    
    return Response.json({
      success: true,
      message: 'Parámetros guardados correctamente'
    });

  } catch (error) {
    console.error('Error guardando parámetros:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Aquí podrías cargar los parámetros desde la base de datos
    return Response.json({
      success: true,
      data: {
        vigenciaDefecto: 180,
        vigenciaMax: 365,
        montos: [
          { nombre: 'Desayuno', monto: 7500 },
          { nombre: 'Almuerzo', monto: 9000 }
        ],
        min: 3000,
        max: 50000,
        step: 500
      }
    });

  } catch (error) {
    console.error('Error cargando parámetros:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}
