require('dotenv').config({ path: './.env.local' });
const nodemailer = require('nodemailer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testEmailToAnyAddress() {
  console.log('📧 PRUEBA DE ENVÍO A CUALQUIER EMAIL\n');
  
  // Verificar configuración
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD.includes('tu-')) {
    console.log('❌ Error: Configuración de Gmail incompleta');
    console.log('🔧 Actualiza el archivo .env.local con:');
    console.log('   GMAIL_USER=tu-email@gmail.com');
    console.log('   GMAIL_APP_PASSWORD=tu-contraseña-de-16-caracteres');
    process.exit(1);
  }

  console.log(`📤 Enviando desde: ${process.env.GMAIL_USER}`);
  console.log('');

  rl.question('📧 ¿A qué email quieres enviar la prueba? ', async (destinatario) => {
    if (!destinatario.includes('@')) {
      console.log('❌ Email inválido');
      rl.close();
      return;
    }

    console.log(`\n🎯 Enviando email de prueba a: ${destinatario}`);
    console.log('⏳ Procesando...\n');

    try {
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
        subject: '🎁 Prueba - Sistema Gift Card',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🧪 Email de Prueba</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Sistema Gift Card Funcionando</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">¡Prueba Exitosa! ✅</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p><strong>📤 Enviado desde:</strong> ${process.env.GMAIL_USER}</p>
                <p><strong>📧 Recibido en:</strong> ${destinatario}</p>
                <p><strong>🕐 Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>✅ Estado:</strong> Sistema funcionando correctamente</p>
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3;">
                <h4 style="color: #1976D2; margin-top: 0;">🎉 ¡Sistema Listo!</h4>
                <p style="color: #333; margin-bottom: 0;">
                  El sistema de Gift Cards puede enviar emails a cualquier dirección. 
                  Ya puedes usar el carrito y los clientes recibirán sus comprobantes automáticamente.
                </p>
              </div>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ ¡EMAIL ENVIADO EXITOSAMENTE!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📫 Destinatario: ${destinatario}`);
      console.log('');
      console.log('🎉 El sistema está listo para enviar a cualquier email');
      console.log('💡 Revisa la bandeja de entrada (y spam) del destinatario');
      
    } catch (error) {
      console.log('❌ Error enviando email:', error.message);
      
      if (error.code === 'EAUTH') {
        console.log('💡 Error de autenticación - revisa la contraseña de aplicación');
      }
    }
    
    rl.close();
  });
}

testEmailToAnyAddress();
