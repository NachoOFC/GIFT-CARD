// Script de prueba para verificar QR en email y página de recibo
console.log('🧪 Iniciando prueba completa del sistema QR...\n');

const testOrder = {
    monto: 25000,
    email_destinatario: 'alexanderviveros9@gmail.com',
    customer_name: 'Test User QR'
};

async function testCompleteFlow() {
    try {
        console.log('📤 1. Creando gift card y enviando email...');
        
        const response = await fetch('http://localhost:3000/api/giftcard/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testOrder)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        
        console.log('✅ Gift card creada:');
        console.log('   📋 Orden ID:', result.order_id);
        console.log('   📧 Email enviado:', result.email_sent);
        console.log('   🔲 QR generado:', !!result.qr_code);

        if (result.order_id) {
            console.log('\n📤 2. Probando página de comprobante...');
            
            const receiptResponse = await fetch(`http://localhost:3000/api/orders/${result.order_id}`);
            const receiptData = await receiptResponse.json();
            
            console.log('✅ API de comprobante:');
            console.log('   📋 Estado:', receiptData.success ? 'OK' : 'ERROR');
            console.log('   💰 Total:', receiptData.order?.total);
            console.log('   📧 Email:', receiptData.order?.email_comprador);
            
            console.log('\n🌐 3. URL del comprobante:');
            console.log(`   http://localhost:3000/receipt/${result.order_id}`);
        }

        return result;
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        return null;
    }
}

// Ejecutar prueba si estamos en Node.js
if (typeof window === 'undefined') {
    console.log('⚠️  Para ejecutar esta prueba, usa el navegador o curl');
    console.log('🌐 Ve a: http://localhost:3000/cart para hacer una compra de prueba');
}
