(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/gift-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: `NODE-TEST-${Date.now()}`,
        valor_inicial: 5,
        fecha_expiracion: '2026-08-16',
        email_destinatario: 'a@b.com',
        mensaje: 'test from node',
        empresa: 1
      }),
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
