require('dotenv').config({ path: './.env.local' });
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

async function testQRInEmail() {
  console.log('🧪 Probando QR mejorado en email...\n');

  // Datos de prueba
  const orderData = {
    orderId: 999,
    orderNumber: 'ORDER-1756326014441',
    monto: 119000,
    email: 'alexanderviveros9@gmail.com',
    receiptUrl: 'http://localhost:3000/receipt/ORDER-1756326014441'
  };

  try {
    // Generar QR con la configuración mejorada (igual que el componente CreateQr)
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(orderData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      },
      width: 300
    });

    console.log('✅ QR generado con configuración mejorada');
    console.log(`📏 Tamaño: ${qrCodeDataURL.length} caracteres`);

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'alexanderviveros9@gmail.com',
      subject: '🧾 Comprobante de Compra - QR Mejorado',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comprobante de Compra</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; color: #ffffff;">🧾 Comprobante de Compra</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; color: #ffffff;">QR Mejorado - Prueba</p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px;">
                      <table role="presentation" style="width: 100%; margin: 20px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <h3 style="color: #333; margin: 0 0 15px 0;">🔲 Código QR del Comprobante</h3>
                            
                            <table role="presentation" style="margin: 0 auto; background: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                              <tr>
                                <td>
                                  <img src="${qrCodeDataURL}" 
                                       alt="QR Code" 
                                       style="width: 200px; height: 200px; border: none; display: block;" 
                                       width="200" 
                                       height="200" />
                                </td>
                              </tr>
                            </table>
                            
                            <p style="color: #666; margin: 15px 0;">
                              <strong>¿Se muestra el QR correctamente?</strong><br>
                              Orden: ${orderData.orderNumber}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    console.log('✅ Email enviado con QR mejorado');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log('🔍 Revisa tu email para ver si el QR se muestra correctamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQRInEmail();
