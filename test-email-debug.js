const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailConfig() {
  console.log('🔧 Testing email configuration...');
  
  console.log('Environment variables:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '***set***' : '***NOT SET***');
  
  try {
    // Test transporter creation
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      secure: false,
      requireTLS: true,
      port: 587
    });

    console.log('✅ Transporter created successfully');

    // Verify connection
    const verified = await transporter.verify();
    console.log('✅ Connection verified:', verified);

    // Send test email
    const testResult = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to self for testing
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
    console.error('Full error:', error);
  }
}

testEmailConfig();
