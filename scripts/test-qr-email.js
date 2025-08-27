require('dotenv').config({ path: './.env.local' });
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testEmailWithQR() {
  console.log('📧 PRUEBA DE EMAIL CON CÓDIGO QR\n');
  
  // Verificar configuración
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('❌ Error: Configuración de Gmail incompleta');
    process.exit(1);
  }

  rl.question('📧 ¿A qué email enviar la prueba? ', async (destinatario) => {
    if (!destinatario.includes('@')) {
      console.log('❌ Email inválido');
      rl.close();
      return;
    }

    console.log(`\n🎯 Generando QR y enviando a: ${destinatario}`);
    console.log('⏳ Procesando...\n');

    try {
      // Datos del comprobante de prueba
      const orderData = {
        orderId: 999,
        orderNumber: `TEST-QR-${Date.now()}`,
        monto: 119000,
        email: destinatario,
        receiptUrl: 'http://localhost:3000/receipt/TEST-QR-123'
      };

      // Generar QR Code
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(orderData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        type: 'image/png'
      });

      console.log('✅ Código QR generado');
      console.log(`📏 Tamaño del QR: ${qrCodeDataURL.length} caracteres`);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: destinatario,
        subject: '🧪 Prueba QR - Comprobante de Compra',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🧪 Prueba de QR</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Verificando visualización del código QR</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Detalles de tu Compra</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p><strong>🆔 Número de Orden:</strong> ${orderData.orderNumber}</p>
                <p><strong>👤 Cliente:</strong> Cliente de Prueba</p>
                <p><strong>💰 Total:</strong> $${orderData.monto.toLocaleString()}</p>
                <p><strong>📧 Email:</strong> ${destinatario}</p>
                <p><strong>📅 Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">🔲 Código QR del Comprobante</h3>
                <div style="background: white; padding: 15px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <img src="${qrCodeDataURL}" alt="Código QR del Comprobante" style="width: 200px; height: 200px; border: none; display: block;" />
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 15px;">
                  📱 <strong>¿Puedes ver el código QR arriba?</strong><br>
                  Si no se muestra, revisa la configuración de imágenes en tu email
                </p>
                
                <div style="margin-top: 15px; padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4CAF50;">
                  <h4 style="color: #2E7D32; margin-top: 0;">✅ Prueba de Visualización:</h4>
                  <ul style="text-align: left; color: #333; padding-left: 20px;">
                    <li><strong>¿Se muestra el QR?</strong> Sí / No</li>
                    <li><strong>¿Se ve completo?</strong> Sí / No</li>
                    <li><strong>¿Es escaneble?</strong> Sí / No</li>
                    <li><strong>Orden de prueba:</strong> ${orderData.orderNumber}</li>
                  </ul>
                </div>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0;"><strong>💡 Nota:</strong> Este es un email de prueba para verificar que los códigos QR se muestren correctamente en los comprobantes reales.</p>
              </div>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ ¡EMAIL CON QR ENVIADO!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📫 Destinatario: ${destinatario}`);
      console.log('');
      console.log('🔍 Verifica en tu email:');
      console.log('  1. ¿Se muestra el código QR?');
      console.log('  2. ¿Se ve nítido y completo?');
      console.log('  3. ¿Puedes escanearlo con tu teléfono?');
      console.log('');
      console.log('💡 Si no se ve, revisa la configuración de imágenes en Gmail/Outlook');
      
    } catch (error) {
      console.log('❌ Error enviando email:', error.message);
    }
    
    rl.close();
  });
}

testEmailWithQR();
