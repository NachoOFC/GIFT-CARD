import pool from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { items, empresa } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Se requiere un arreglo items con al menos un elemento' });
  }

  // Normaliza items y valida campos mínimos
  const normalizedItems = items.map((raw, index) => {
    const codigo = `${raw.codigo ?? ''}`.trim();
    const valor_inicial = Number(raw.valor_inicial ?? raw.monto ?? raw.valor ?? 0);
    const fecha_expiracion = raw.fecha_expiracion || raw.expiracion || null;
    const email_destinatario = raw.email_destinatario || raw.email || null;
    const mensaje = raw.mensaje || raw.message || null;
    const empresaItem = raw.empresa || empresa || null;
    return { index, codigo, valor_inicial, fecha_expiracion, email_destinatario, mensaje, empresa: empresaItem };
  });

  const invalid = normalizedItems.filter(it => !it.codigo || !it.valor_inicial || isNaN(it.valor_inicial));
  if (invalid.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Algunos registros no tienen código o monto válido',
      invalid: invalid.map(i => ({ index: i.index, codigo: i.codigo, valor_inicial: i.valor_inicial }))
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar duplicados en la BD de una sola vez
    const codigos = normalizedItems.map(i => i.codigo);
    let conflicts = [];
    let toInsert = normalizedItems;
    if (codigos.length > 0) {
      const placeholders = codigos.map(() => '?').join(',');
      const [existing] = await connection.query(
        `SELECT codigo FROM gift_cards WHERE codigo IN (${placeholders})`,
        codigos
      );
      if (existing.length > 0) {
        const existentes = new Set(existing.map(r => r.codigo));
        conflicts = normalizedItems
          .filter(i => existentes.has(i.codigo))
          .map(i => ({ index: i.index, codigo: i.codigo }));
        toInsert = normalizedItems.filter(i => !existentes.has(i.codigo));
      }
    }

    // Si todos son conflictivos, no insertamos nada
    if (toInsert.length === 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Códigos ya existen', conflicts });
    }

    // Insertar en lote (loop transaccional)
    const results = [];
    for (const item of toInsert) {
      const [result] = await connection.execute(
        'INSERT INTO gift_cards (codigo, valor_inicial, saldo_actual, fecha_expiracion, email_destinatario, empresa, mensaje) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.codigo, item.valor_inicial, item.valor_inicial, item.fecha_expiracion, item.email_destinatario, item.empresa, item.mensaje]
      );
      results.push({ index: item.index, id: result.insertId, codigo: item.codigo });
    }

    await connection.commit();
    return res.status(201).json({ success: true, inserted: results.length, skipped: conflicts.length, conflicts, results });
  } catch (error) {
    await connection.rollback();
    console.error('Error en creación masiva:', error);
    return res.status(500).json({ success: false, message: 'Error al crear gift cards en lote' });
  } finally {
    connection.release();
  }
}


