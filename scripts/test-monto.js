const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testMonto() {
  console.log('🧪 Probando campo monto...\n');

  try {
    // Crear gift card con diferentes montos
    const testCases = [
      { monto: 100, desc: 'Monto entero' },
      { monto: 1500.50, desc: 'Monto con decimales' },
      { monto: 999999, desc: 'Monto grande' }
    ];

    for (const testCase of testCases) {
      console.log(`Probando: ${testCase.desc} - $${testCase.monto}`);
      
      const giftCard = {
        codigo: 'TEST-MONTO-' + Date.now(),
        valor_inicial: testCase.monto,
        fecha_expiracion: '2025-12-31',
        email_destinatario: 'test@example.com',
        mensaje: `Prueba de monto: $${testCase.monto}`,
        empresa: 'Empresa Test'
      };

      const response = await fetch(`${BASE_URL}/gift-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(giftCard),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${testCase.desc}: Creada exitosamente`);
        
        // Verificar que se guardó correctamente
        const getResponse = await fetch(`${BASE_URL}/gift-cards/${data.data.insertId}`);
        const getData = await getResponse.json();
        
        if (getData.success && getData.data.valor_inicial === testCase.monto) {
          console.log(`✅ ${testCase.desc}: Monto guardado correctamente ($${getData.data.valor_inicial})`);
        } else {
          console.log(`❌ ${testCase.desc}: Error en el monto guardado`);
        }
        
        // Limpiar - eliminar la gift card de prueba
        await fetch(`${BASE_URL}/gift-cards/${data.data.insertId}`, {
          method: 'DELETE',
        });
        
      } else {
        console.log(`❌ ${testCase.desc}: Error al crear - ${data.message}`);
      }
      
      console.log('---');
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }

  console.log('🏁 Pruebas de monto completadas');
}

// Ejecutar las pruebas
testMonto();
