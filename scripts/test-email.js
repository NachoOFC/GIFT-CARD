require('dotenv').config({ path: './.env.local' });
const nodemailer = require('nodemailer');

async function testEmailConnection() {
  console.log('📧 Probando configuración de email...\n');

  // Mostrar configuración actual (sin mostrar la contraseña completa)
  console.log('📋 Configuración actual:');
  console.log(`  Gmail User: ${process.env.GMAIL_USER || '[NO CONFIGURADO]'}`);
  console.log(`  Gmail Password: ${process.env.GMAIL_APP_PASSWORD ? '[CONFIGURADO]' : '[NO CONFIGURADO]'}`);
  console.log('');

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === 'tu-app-password-de-gmail') {
    console.log('❌ PROBLEMA ENCONTRADO: Configuración de email incompleta');
    console.log('\n🔧 Para configurar Gmail:');
    console.log('1. Ve a https://myaccount.google.com/security');
    console.log('2. Activa "Verificación en 2 pasos"');
    console.log('3. Ve a "Contraseñas de aplicación"');
    console.log('4. Genera una nueva contraseña de aplicación para "Mail"');
    console.log('5. Copia la contraseña de 16 caracteres');
    console.log('6. Actualiza el archivo .env.local:');
    console.log('   GMAIL_USER=tu-email@gmail.com');
    console.log('   GMAIL_APP_PASSWORD=la-contraseña-de-16-caracteres');
    console.log('');
    return;
  }

  try {
    console.log('🔄 Creando transportador de nodemailer...');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    console.log('✅ Transportador creado');
    console.log('🔄 Verificando conexión...');
    
    await transporter.verify();
    console.log('✅ ¡Conexión exitosa con Gmail!');
    
    console.log('\n📨 Enviando email de prueba...');
    
    const testEmail = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Enviamos a nosotros mismos para probar
      subject: '🧪 Prueba de Email - Gift Card System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1>✅ ¡Email Funcionando!</h1>
          </div>
          <div style="padding: 20px; background: white;">
            <p>Este es un email de prueba del sistema de Gift Cards.</p>
            <p><strong>Configuración exitosa:</strong></p>
            <ul>
              <li>✅ Nodemailer configurado</li>
              <li>✅ Gmail SMTP funcionando</li>
              <li>✅ Autenticación correcta</li>
            </ul>
            <p style="color: #666;">Enviado desde: ${process.env.GMAIL_USER}</p>
            <p style="color: #666;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    
    console.log('✅ ¡Email enviado exitosamente!');
    console.log(`  📧 Message ID: ${result.messageId}`);
    console.log(`  📫 Destinatario: ${process.env.GMAIL_USER}`);
    console.log('');
    console.log('🎉 El sistema de email está funcionando correctamente');
    console.log('💡 Revisa tu bandeja de entrada (y spam) en Gmail');

  } catch (error) {
    console.log('❌ Error en la conexión de email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Error de autenticación. Posibles causas:');
      console.log('  - Contraseña de aplicación incorrecta');
      console.log('  - Verificación en 2 pasos no activada');
      console.log('  - Email incorrecto');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Error de conexión. Posibles causas:');
      console.log('  - Sin conexión a internet');
      console.log('  - Firewall bloqueando Gmail');
    } else {
      console.log('\n💡 Error desconocido:', error.code);
    }
  }
}

testEmailConnection();
