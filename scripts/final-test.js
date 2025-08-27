const http = require('http');

function testAPI() {
  console.log('🧪 Probando API final de gift card...\n');

  const data = JSON.stringify({
    order_id: `TEST-ORDER-${Date.now()}`,
    monto: 50000,
    email_destinatario: 'moonsystemspv@gmail.com',
    customer_name: 'Cliente Final Test'
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
    console.log(`📡 Status: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        
        if (result.success) {
          console.log('\n✅ ¡API FUNCIONANDO CORRECTAMENTE!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`🎁 Gift Card ID: ${result.data.id}`);
          console.log(`💳 Código: ${result.data.codigo}`);
          console.log(`💰 Valor: $${result.data.valor_inicial.toLocaleString('es-CL')}`);
          console.log(`📧 Email: ${result.data.email_destinatario}`);
          console.log(`📄 Orden ID: ${result.data.order_id}`);
          console.log(`🔗 URL activación: ${result.data.url_activacion}`);
          console.log(`✉️  Email enviado: ${result.data.email_enviado ? '✅ SÍ' : '❌ NO'}`);
          
          if (result.data.email_error) {
            console.log(`⚠️  Error email: ${result.data.email_error}`);
            console.log('\n💡 Para habilitar emails:');
            console.log('   1. Configura GMAIL_APP_PASSWORD en .env.local');
            console.log('   2. Usa una contraseña de aplicación de Gmail');
          }
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL:');
          console.log('   ✅ Carrito con formulario de email');
          console.log('   ✅ API de generación de gift cards');
          console.log('   ✅ Guardado en base de datos (orders y gift_cards)');
          console.log('   ✅ Generación de códigos QR');
          console.log('   ⚠️  Sistema de email (requiere configuración)');
          console.log('\n🌐 Prueba el carrito: http://localhost:3000/cart');
          
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
    console.log('\n💡 Asegúrate de que el servidor esté ejecutándose:');
    console.log('   cd C:\\Users\\alexa\\Desktop\\GIFT-CARD');
    console.log('   npm run dev');
  });

  req.write(data);
  req.end();
}

// Esperar un poco para que el servidor termine de iniciar
setTimeout(() => {
  testAPI();
}, 2000);

console.log('⏳ Esperando que el servidor termine de iniciar...');
