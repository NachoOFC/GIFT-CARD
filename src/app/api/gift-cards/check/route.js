import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const codigo = url.searchParams.get('codigo');

    if (!codigo) {
      return NextResponse.json({ success: false, message: 'codigo requerido' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT 1 FROM gift_cards WHERE codigo = ? LIMIT 1', [codigo]);
      return NextResponse.json({ success: true, exists: rows.length > 0 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error checking code:', error);
    return NextResponse.json({ success: false, message: 'Error checking code' }, { status: 500 });
  }
}
