import pool from '../../../../utils/db';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

// Función para enviar email de comprobante
async function sendReceiptEmail({ to, purchaseData, transactionId, qrDataURL }) {
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
      to: to,
      subject: `🧾 Comprobante de Compra - Orden ${transactionId}`,
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
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">🧾 Comprobante de Compra</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; color: #ffffff;">¡Gracias por tu compra!</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9f9f9;">
                      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Detalles de tu Compra</h2>
                      
                      <!-- Order Details -->
                      <table role="presentation" style="width: 100%; background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <tr><td style="padding: 5px 0;"><strong style="color: #333;">🆔 Número de Orden:</strong> ${transactionId}</td></tr>
                        <tr><td style="padding: 5px 0;"><strong style="color: #333;">👤 Cliente:</strong> ${purchaseData.customerName}</td></tr>
                        <tr><td style="padding: 5px 0;"><strong style="color: #333;">💰 Total:</strong> $${purchaseData.amount.toLocaleString()}</td></tr>
                        <tr><td style="padding: 5px 0;"><strong style="color: #333;">📧 Email:</strong> ${to}</td></tr>
                        <tr><td style="padding: 5px 0;"><strong style="color: #333;">📅 Fecha:</strong> ${new Date().toLocaleString('es-ES')}</td></tr>
                      </table>
                      
                      <!-- QR Code Section -->
                      <table role="presentation" style="width: 100%; margin: 30px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">🔲 Código QR del Comprobante</h3>
                            
                            <!-- QR Container -->
                            <table role="presentation" style="margin: 0 auto; background: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                              <tr>
                                <td style="text-align: center;">
                                  <img src="${qrDataURL}" 
                                       alt="Código QR del Comprobante - Orden ${transactionId}" 
                                       style="width: 200px; height: 200px; border: none; display: block; margin: 0 auto;" 
                                       width="200" 
                                       height="200" />
                                </td>
                              </tr>
                            </table>
                            
                            <p style="color: #666; font-size: 14px; margin: 15px 0; line-height: 1.5;">
                              📱 <strong>Escanea este código QR para verificar tu compra</strong><br>
                              Si no puedes ver la imagen, usa el número de orden: <strong>${transactionId}</strong>
                            </p>
                            
                            <!-- Fallback info -->
                            <table role="presentation" style="width: 100%; margin: 15px 0; padding: 10px; background: #f0f8ff; border-radius: 5px;">
                              <tr>
                                <td style="font-size: 12px; color: #666; text-align: center;">
                                  💡 Si el QR no se muestra, asegúrate de que tu cliente de email permita mostrar imágenes
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Important Info -->
                      <table role="presentation" style="width: 100%; background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3;">
                        <tr>
                          <td>
                            <h4 style="color: #1976D2; margin: 0 0 10px 0; font-size: 16px;">📋 Información Importante:</h4>
                            <ul style="color: #333; padding-left: 20px; margin: 0;">
                              <li style="margin: 5px 0;">Guarda este email como comprobante de tu compra</li>
                              <li style="margin: 5px 0;">Tu compra ha sido procesada exitosamente</li>
                              <li style="margin: 5px 0;">El estado de tu orden es: <strong>PAGADO</strong></li>
                              <li style="margin: 5px 0;">Número de orden: <strong>${transactionId}</strong></li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="text-align: center; padding: 30px; border-top: 1px solid #ddd;">
                      <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">
                        ¡Gracias por confiar en nosotros!<br>
                        Si tienes alguna pregunta, no dudes en contactarnos.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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

export async function POST(request) {
  try {
    const { order_id, monto, email_destinatario, mensaje, customer_name } = await request.json();

    // Validar parámetros requeridos
    if (!order_id || !monto || !email_destinatario) {
      return Response.json({
        success: false,
        error: 'Parámetros requeridos: order_id, monto, email_destinatario'
      }, { status: 400 });
    }
    
    // SOLO crear la orden en la tabla orders (NO crear gift card)
    const [orderResult] = await pool.execute(`
      INSERT INTO orders (
        numero_orden,
        email_comprador,
        total,
        estado,
        fecha_orden,
        gift_card_id
      ) VALUES (?, ?, ?, ?, NOW(), ?)
    `, [
      order_id,
      email_destinatario,
      monto,
      'pagado', // marcamos como pagado inmediatamente
      null // No hay gift_card_id porque no creamos gift card
    ]);

    const orderId = orderResult.insertId;
    console.log('✅ Orden creada:', orderId, 'con número:', order_id);

    // Generar datos para el QR code del comprobante
    const receiptUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/receipt/${order_id}`;
    const qrData = JSON.stringify({
      orderId: orderId,
      orderNumber: order_id,
      monto: monto,
      email: email_destinatario,
      receiptUrl: receiptUrl
    });

    // Generar QR Code para el comprobante (usando configuración mejorada)
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#1f2937', // Color oscuro (gris oscuro)
        light: '#ffffff' // Color claro (blanco)
      },
      width: 300
    });

    let emailSent = false;
    let emailError = null;

    // Intentar enviar email de comprobante
    try {
      const emailResult = await sendReceiptEmail({
        to: email_destinatario,
        purchaseData: {
          amount: monto,
          orderNumber: order_id,
          customerName: customer_name || 'Cliente'
        },
        transactionId: order_id,
        qrDataURL: qrCodeDataURL
      });
      
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error;
        console.error('❌ Error enviando email:', emailResult.error);
      } else {
        console.log('✅ Email enviado correctamente');
      }
    } catch (error) {
      emailError = error.message;
      console.error('❌ Excepción enviando email:', error);
    }

    return Response.json({
      success: true,
      data: {
        id: orderId,
        order_number: order_id,
        total: monto,
        fecha_compra: new Date().toISOString().split('T')[0],
        estado: 'PAGADO',
        email_destinatario: email_destinatario,
        customer_name: customer_name || 'Cliente',
        qr_code: qrCodeDataURL,
        receipt_url: `/receipt/${order_id}`,
        email_enviado: emailSent,
        email_error: emailError,
        order_id: orderId
      },
      message: emailSent 
        ? 'Compra procesada y comprobante enviado exitosamente'
        : 'Compra procesada, pero no se pudo enviar el comprobante por email'
    });

  } catch (error) {
    console.error('Error generando gift card:', error);
    return Response.json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }, { status: 500 });
  }
}
