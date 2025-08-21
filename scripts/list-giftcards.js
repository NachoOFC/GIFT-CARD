const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'gift-card'
  });

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id, codigo, valor_inicial, saldo_actual, fecha_expiracion, email_destinatario, mensaje, empresa_id FROM gift_cards ORDER BY id DESC LIMIT 20');
    console.log('ROWS:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('ERROR', err.message || err);
  } finally {
    conn.release();
    await pool.end();
  }
})();
