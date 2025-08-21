import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      const [giftCards] = await connection.query(`
        SELECT id, codigo, valor_inicial, saldo_actual, 
               activa, fecha_creacion, fecha_expiracion, 
               email_destinatario, mensaje, empresa_id AS empresa 
        FROM gift_cards
        ORDER BY fecha_creacion DESC
      `);
      return NextResponse.json({ 
        success: true, 
        data: giftCards
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al obtener gift cards:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al obtener gift cards' 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { 
      codigo,
      valor_inicial,
      fecha_expiracion,
      email_destinatario,
      mensaje,
      empresa
    } = await req.json();
    
    if (!codigo || !valor_inicial) {
      return NextResponse.json({ 
        success: false, 
        message: 'Se requieren código y valor inicial' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Normalizar valores: convertir undefined/'' a null para los bind params
      const empresa_id = (empresa !== undefined && empresa !== null && !isNaN(Number(empresa))) ? Number(empresa) : null;
      const safe = (v) => (v === undefined || v === '' ? null : v);

      const params = [
        safe(codigo),
        safe(valor_inicial),
        safe(valor_inicial), // saldo_actual inicial igual al valor_inicial
        safe(fecha_expiracion),
        safe(email_destinatario),
        safe(mensaje),
        safe(empresa_id)
      ];

      const [result] = await connection.execute(
        `INSERT INTO gift_cards (
          codigo,
          valor_inicial,
          saldo_actual,
          activa,
          fecha_creacion,
          fecha_expiracion,
          email_destinatario,
          mensaje,
          empresa_id
        ) VALUES (?, ?, ?, TRUE, NOW(), ?, ?, ?, ?)`,
        params
      );

      await connection.commit();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Gift card creada exitosamente',
        data: result
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      // Manejar duplicados de código (clave única)
      if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
        return NextResponse.json({ success: false, message: 'El código ya existe' }, { status: 409 });
      }
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al crear gift card:', error);
    // Respuesta ampliada temporalmente para depuración local
    return NextResponse.json({ 
      success: false, 
      message: 'Error al crear gift card',
      error: error && error.message ? String(error.message) : null,
      stack: error && error.stack ? String(error.stack) : null
    }, { status: 500 });
  }
}
