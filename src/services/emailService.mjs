import nodemailer from 'nodemailer';

// Configurar transportador de nodemailer
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Tu email de Gmail
    pass: process.env.GMAIL_APP_PASSWORD // Tu contraseña de aplicación de Gmail
  }
});

// Función para enviar email de comprobante
export async function sendReceiptEmail({ to, giftCardData, transactionId, qrDataURL }) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: `🎁 Tu Gift Card está lista - Compra ${transactionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎁 ¡Tu Gift Card está lista!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Gracias por tu compra</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Detalles de tu Gift Card</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p><strong>💳 Código:</strong> ${giftCardData.code}</p>
              <p><strong>💰 Valor:</strong> $${giftCardData.amount.toLocaleString()}</p>
              <p><strong>📧 Email:</strong> ${to}</p>
              <p><strong>🆔 Número de Orden:</strong> ${transactionId}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">Código QR para Activación</h3>
              <img src="${qrDataURL}" alt="QR Code" style="width: 200px; height: 200px; border: 2px solid #ddd;" />
              <p style="color: #666; font-size: 14px; margin-top: 10px;">
                Escanea este código QR para activar tu Gift Card
              </p>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3;">
              <h4 style="color: #1976D2; margin-top: 0;">📋 Instrucciones:</h4>
              <ol style="color: #333; padding-left: 20px;">
                <li>Guarda este email como comprobante de tu compra</li>
                <li>Tu Gift Card ya está activa y lista para usar</li>
                <li>Puedes usar el código QR para activarla en nuestro sitio</li>
                <li>El código de la Gift Card es: <strong>${giftCardData.code}</strong></li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                ¡Gracias por confiar en nosotros!<br>
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      info: result
    };

  } catch (error) {
    console.error('Error enviando email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función de prueba para verificar la configuración del transportador
export async function testEmailConnection() {
  try {
    await transporter.verify();
    return { success: true, message: 'Conexión de email configurada correctamente' };
  } catch (error) {
    console.error('Error de conexión de email:', error);
    return { success: false, error: error.message };
  }
}

const emailService = { sendReceiptEmail, testEmailConnection };
export default emailService;
