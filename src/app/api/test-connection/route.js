import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Obtener todas las tablas de la base de datos
      const [tables] = await connection.query('SHOW TABLES');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Conexión exitosa',
        tables
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al conectar con la base de datos' 
    }, { status: 500 });
  }
}
