const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailConfig() {
  console.log('🔧 Testing email configuration...');
  
  console.log('Environment variables:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '***set***' : '***NOT SET***');
  
  try {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');
  console.log('Sanitized app password length:', pass ? pass.length : 0);

    // Test transporter creation (usar SMTP directo y secure: true)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    console.log('✅ Transporter created successfully');

    // Verify connection
  const verified = await transporter.verify();
    console.log('✅ Connection verified:', verified);

    // Send test email
    const testResult = await transporter.sendMail({
  from: user,
  to: user, // Send to self for testing
      subject: 'Test Email - Gift Card System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from the gift card system.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', testResult.messageId);
    console.log('Response:', testResult.response);

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (String(error.message || '').includes('Username and Password not accepted')) {
      console.error('\nSugerencias:');
      console.error('- Asegúrate de usar una Contraseña de aplicación de 16 caracteres (no la contraseña normal).');
      console.error('- Quita espacios: debe ser 16 caracteres continuos.');
      console.error('- Verifica que GMAIL_USER coincida con la cuenta que generó la contraseña de app.');
    }
    console.error('Full error:', error);
  }
}

testEmailConfig();
