import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function POST(req) {
  try {
    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ 
        message: 'Se requieren orderId y amount' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Ejemplo de actualización de una orden
      await connection.execute(
        'UPDATE ordenes SET estado = ?, fecha_pago = NOW() WHERE id = ?',
        ['PAGADA', orderId]
      );

      await connection.commit();

      return NextResponse.json({ 
        success: true, 
        message: 'Pago procesado correctamente'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al procesar el pago' 
    }, { status: 500 });
  }
}
