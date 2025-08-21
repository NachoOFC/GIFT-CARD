import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT id, codigo, valor_inicial, saldo_actual, activa, fecha_creacion, fecha_expiracion, email_destinatario, mensaje, empresa_id AS empresa FROM gift_cards WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!rows || rows.length === 0) {
        return NextResponse.json({ success: false, message: 'No encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: rows[0] });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error GET /gift-cards/[id]:', error);
    return NextResponse.json({ success: false, message: 'Error al obtener' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();
    const fields = [];
    const values = [];

    const safe = (v) => (v === undefined || v === '' ? null : v);

    if ('codigo' in body) { fields.push('codigo = ?'); values.push(safe(body.codigo)); }
    if ('valor_inicial' in body) { fields.push('valor_inicial = ?'); values.push(safe(body.valor_inicial)); }
    if ('saldo_actual' in body) { fields.push('saldo_actual = ?'); values.push(safe(body.saldo_actual)); }
    if ('activa' in body) { fields.push('activa = ?'); values.push(body.activa ? 1 : 0); }
    if ('fecha_expiracion' in body) { fields.push('fecha_expiracion = ?'); values.push(safe(body.fecha_expiracion)); }
    if ('email_destinatario' in body) { fields.push('email_destinatario = ?'); values.push(safe(body.email_destinatario)); }
    if ('mensaje' in body) { fields.push('mensaje = ?'); values.push(safe(body.mensaje)); }
    if ('empresa' in body) {
      const empresa_id = (body.empresa !== undefined && body.empresa !== null && !isNaN(Number(body.empresa))) ? Number(body.empresa) : null;
      fields.push('empresa_id = ?'); values.push(empresa_id);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: 'Nada que actualizar' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const sql = `UPDATE gift_cards SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);
      const [result] = await connection.execute(sql, values);
      return NextResponse.json({ success: true, data: result });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error PUT /gift-cards/[id]:', error);
    return NextResponse.json({ success: false, message: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM gift_cards WHERE id = ?', [id]);
      return NextResponse.json({ success: true, data: result });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error DELETE /gift-cards/[id]:', error);
    return NextResponse.json({ success: false, message: 'Error al eliminar' }, { status: 500 });
  }
}
