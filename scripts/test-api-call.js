const https = require('https');

async function testAPI() {
  console.log('🧪 Probando API de gift card...\n');

  const data = JSON.stringify({
    order_id: `TEST-ORDER-${Date.now()}`,
    monto: 25000,
    email_destinatario: 'moonsystemspv@gmail.com',
    mensaje: '¡Gracias por tu compra!',
    customer_name: 'Cliente Test'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/giftcard/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        
        if (result.success) {
          console.log('✅ API Response exitosa:');
          console.log(`  🎁 Gift Card ID: ${result.data.id}`);
          console.log(`  💳 Código: ${result.data.codigo}`);
          console.log(`  💰 Valor: $${result.data.valor_inicial.toLocaleString()}`);
          console.log(`  📧 Email: ${result.data.email_destinatario}`);
          console.log(`  📄 Orden ID: ${result.data.order_id}`);
          console.log(`  ✉️  Email enviado: ${result.data.email_enviado ? '✅' : '❌'}`);
          
          if (result.data.email_error) {
            console.log(`  ⚠️  Error email: ${result.data.email_error}`);
          }
          
        } else {
          console.log('❌ Error en API:', result.error);
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Response body:', body);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
    
    // Intentar con HTTP en lugar de HTTPS
    console.log('\n🔄 Intentando con HTTP...');
    testWithHTTP();
  });

  req.write(data);
  req.end();
}

function testWithHTTP() {
  const http = require('http');
  
  const data = JSON.stringify({
    order_id: `TEST-ORDER-${Date.now()}`,
    monto: 25000,
    email_destinatario: 'moonsystemspv@gmail.com',
    mensaje: '¡Gracias por tu compra!',
    customer_name: 'Cliente Test'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/giftcard/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        
        if (result.success) {
          console.log('✅ API Response exitosa (HTTP):');
          console.log(`  🎁 Gift Card ID: ${result.data.id}`);
          console.log(`  💳 Código: ${result.data.codigo}`);
          console.log(`  💰 Valor: $${result.data.valor_inicial.toLocaleString()}`);
          console.log(`  📧 Email: ${result.data.email_destinatario}`);
          console.log(`  📄 Orden ID: ${result.data.order_id}`);
          console.log(`  ✉️  Email enviado: ${result.data.email_enviado ? '✅' : '❌'}`);
          
          if (result.data.email_error) {
            console.log(`  ⚠️  Error email: ${result.data.email_error}`);
          }
          
        } else {
          console.log('❌ Error en API:', result.error);
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Response body:', body);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ HTTP Request error:', error.message);
  });

  req.write(data);
  req.end();
}

testAPI();
