import pool from '../../../../utils/db.ts';

function generateOrderNumber(prefix = 'CORP') {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${y}${m}${d}-${rand}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { empresa, cliente, clientOrderId, items, notificaciones } = body || {};

    if (!empresa) {
      return Response.json({ success: false, message: 'empresa es requerida' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ success: false, message: 'items debe ser un arreglo con al menos un elemento' }, { status: 400 });
    }

    const normalized = items.map((raw, index) => {
      const codigo = raw.codigo ? String(raw.codigo).trim() : null; // puede ser generado
      const valor_inicial = Number(raw.valor_inicial ?? raw.monto ?? 0);
      const fecha_expiracion = raw.fecha_expiracion || null;
      const email_destinatario = raw.email_destinatario || null;
      const mensaje = raw.mensaje || null;
      return { index, codigo, valor_inicial, fecha_expiracion, email_destinatario, mensaje };
    });

    const invalid = normalized.filter(it => !it.valor_inicial || isNaN(it.valor_inicial) || it.valor_inicial <= 0);
    if (invalid.length > 0) {
      return Response.json({ success: false, message: 'items con monto inválido', invalid: invalid.map(i => ({ index: i.index, valor_inicial: i.valor_inicial })) }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Idempotencia por clientOrderId si viene
      let numeroOrden = clientOrderId || generateOrderNumber(empresa?.toString().slice(0,3)?.toUpperCase() || 'CORP');
      if (clientOrderId) {
        const [existingOrders] = await connection.query('SELECT id FROM orders WHERE numero_orden = ?', [clientOrderId]);
        if (existingOrders.length > 0) {
          await connection.rollback();
          return Response.json({ success: false, message: 'clientOrderId ya existe', order_id: existingOrders[0].id }, { status: 409 });
        }
      }

      // Validar posibles duplicados de códigos provistos (omitirlos, no error)
      const withCodes = normalized.filter(i => i.codigo);
      let conflicts = [];
      let itemsToInsert = normalized;
      if (withCodes.length > 0) {
        const codeList = withCodes.map(i => i.codigo);
        const placeholders = codeList.map(() => '?').join(',');
        const [existing] = await connection.query(`SELECT codigo FROM gift_cards WHERE codigo IN (${placeholders})`, codeList);
        if (existing.length > 0) {
          const existsSet = new Set(existing.map(r => r.codigo));
          conflicts = withCodes.filter(i => existsSet.has(i.codigo)).map(i => ({ index: i.index, codigo: i.codigo }));
          itemsToInsert = normalized.filter(i => !i.codigo || !existsSet.has(i.codigo));
        }
      }

      // Si no hay nada que insertar, responder 200 con detalle y sin crear orden
      if (itemsToInsert.length === 0) {
        await connection.rollback();
        return Response.json({ success: true, inserted: 0, skipped: conflicts.length, conflicts, results: [] });
      }

      // Crear orden
      const total = itemsToInsert.reduce((sum, it) => sum + (Number(it.valor_inicial) || 0), 0);
      const emailComprador = cliente?.email || '';
      const nombreComprador = cliente?.nombre || cliente?.razon_social || null;
      const metodoPago = 'corporate';

      let orderResult;
      try {
        // Intento extendido (con columnas nuevas)
        const [resOrder] = await connection.execute(
          'INSERT INTO orders (numero_orden, empresa, email_comprador, nombre_comprador, total, estado, metodo_pago) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [numeroOrden, empresa, emailComprador, nombreComprador, total, 'pendiente', metodoPago]
        );
        orderResult = resOrder;
      } catch (orderErr) {
        // Si la tabla orders aún no tiene las columnas nuevas, caemos a versión mínima
        if (orderErr && orderErr.code === 'ER_BAD_FIELD_ERROR') {
          const [resOrderMin] = await connection.execute(
            'INSERT INTO orders (numero_orden, email_comprador, total, estado) VALUES (?, ?, ?, ?)',
            [numeroOrden, emailComprador || '', total, 'pendiente']
          );
          orderResult = resOrderMin;
        } else {
          throw orderErr;
        }
      }

      const orderId = orderResult.insertId;

      // Insertar gift cards
      const results = [];
      for (const item of itemsToInsert) {
        const codigo = item.codigo || `${numeroOrden}-${String(item.index + 1).padStart(4, '0')}`;
        const [gc] = await connection.execute(
          'INSERT INTO gift_cards (codigo, valor_inicial, saldo_actual, fecha_expiracion, email_destinatario, empresa, mensaje, order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [codigo, item.valor_inicial, item.valor_inicial, item.fecha_expiracion, item.email_destinatario, empresa, item.mensaje, orderId]
        );
        results.push({ index: item.index, id: gc.insertId, codigo });
      }

      await connection.commit();
      return Response.json({ 
        success: true, 
        order: { 
          id: orderId, 
          numero_orden: numeroOrden, 
          empresa, 
          total, 
          cantidad: results.length, 
          estado: 'pendiente' 
        }, 
        inserted: results.length, 
        skipped: conflicts.length, 
        conflicts, 
        results 
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      console.error('Error en corporate bulk:', error);
      return Response.json({ 
        success: false, 
        message: 'Error al procesar orden corporativa', 
        detail: String(error && (error.sqlMessage || error.message || error)) 
      }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return Response.json({ 
      success: false, 
      message: 'Error al procesar la solicitud' 
    }, { status: 400 });
  }
}
