// Script de prueba para verificar la generación consistente de QR
const fetch = require('node-fetch');

async function testQRGeneration() {
    console.log('🧪 Probando generación de QR...\n');
    
    const testData = {
        monto: 50000,
        email_destinatario: 'test@example.com',
        customer_name: 'Test User'
    };

    try {
        console.log('📤 Enviando petición al API...');
        const response = await fetch('http://localhost:3002/api/giftcard/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        console.log('✅ Respuesta exitosa:');
        console.log('📋 Datos de la respuesta:', {
            success: result.success,
            order_id: result.order_id,
            transaction_id: result.transaction_id,
            email_sent: result.email_sent,
            hasQR: !!result.qr_code
        });
        
        if (result.qr_code) {
            console.log('🎯 QR generado - Prefijo:', result.qr_code.substring(0, 50) + '...');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        return null;
    }
}

// Ejecutar test
testQRGeneration().then(() => {
    console.log('\n🏁 Prueba completada');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error crítico:', error);
    process.exit(1);
});
