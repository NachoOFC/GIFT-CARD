import pool from '../../../../utils/db.ts';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

  // Función para enviar email de comprobante con diseño profesional premium
async function sendReceiptEmail({ to, purchaseData, transactionId, qrDataURL, tempPassword }) {
  try {
    // Importar la plantilla de email desde el archivo separado
    // Nota: importamos de forma dinámica para evitar problemas con Next.js y para mantener la compatibilidad
    const receiptEmailTemplateModule = await import('../../../../templates/emails/receipt');
    const receiptEmailTemplate = receiptEmailTemplateModule.default || receiptEmailTemplateModule;
    
    // Sanitizar credenciales y usar configuración SMTP directa (más estable)
    const smtpUser = (process.env.GMAIL_USER || '').trim();
    const smtpPass = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Convertir data URL a buffer para attachment
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: `✅ Comprobante #${transactionId} - MLine`,
      attachments: [
        {
          filename: `comprobante-${purchaseData.orderNumber}.png`,
          content: qrBuffer,
          contentType: 'image/png',
          cid: 'qr-code'
        }
      ],
      // Usar la plantilla externa para generar el HTML del email
      html: receiptEmailTemplate({ transactionId, purchaseData, to, tempPassword })
    };    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      info: result
    };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function POST(request) {
  try {
  const { order_id, monto, email_destinatario, customer_name, beneficiary_name } = await request.json();

    // Validar parámetros requeridos
    if (!order_id || !monto || !email_destinatario) {
      return Response.json({
        success: false,
        error: 'Parámetros requeridos: order_id, monto, email_destinatario'
      }, { status: 400 });
    }
    
    // Crear la orden en la tabla orders con la estructura actual
    const [orderResult] = await pool.execute(`
      INSERT INTO orders (
        numero_orden,
        email_comprador,
        nombre_comprador,
        total,
        estado,
        metodo_pago,
        fecha_orden
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      order_id,
      email_destinatario,
      customer_name || 'Cliente',
      monto,
      'pagado', // marcamos como pagado inmediatamente
      'webpay' // método de pago por defecto
    ]);

    const orderId = orderResult.insertId;
    console.log('✅ Orden creada:', orderId, 'con número:', order_id);

    // Generar datos para el QR code de la gift card (consistente con CreateQr.jsx)
    const activationUrl = `http://localhost:3000/activate/${order_id}`;
    const receiptUrl = `http://localhost:3000/receipt/${order_id}`;
    
    const qrData = JSON.stringify({
      type: 'GIFT_CARD',
      transactionId: order_id,
      amount: parseFloat(monto),
      timestamp: new Date().toISOString(),
      url: activationUrl,
      company: 'MLine',
      orderId: orderId,
      orderNumber: order_id,
      email: email_destinatario,
      receiptUrl: receiptUrl
    });

    // Generar QR Code para la gift card (usando configuración igual a CreateQr.jsx)
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#1f2937', // Color oscuro (gris oscuro)
        light: '#ffffff' // Color claro (blanco)
      },
      width: 256
    });

  let emailSent = false;
  let emailError = null;

    // Generar contraseña temporal y sincronizar con la tabla usuarios
    const generateTempPassword = (len = 8) => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let out = '';
      for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
      return out;
    };
  let tempPassword = generateTempPassword(8);
  const tempExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    try {
      // Beneficiario: upsert por email
      const [benRows] = await pool.query(
        'SELECT id, temp_password FROM beneficiarios WHERE email = ? LIMIT 1',
        [email_destinatario]
      );
      if (benRows.length > 0) {
        // Reusar contraseña existente del beneficiario si está presente
        if (benRows[0].temp_password) {
          tempPassword = benRows[0].temp_password;
        }
        // No sobrescribimos la contraseña; solo actualizamos metadatos mínimos
        await pool.query(
          'UPDATE beneficiarios SET nombre = ?, estado = 1, order_id = ? WHERE id = ?',
          [beneficiary_name || customer_name || 'Beneficiario', orderId, benRows[0].id]
        );
      } else {
        await pool.query(
          'INSERT INTO beneficiarios (nombre, email, temp_password, must_change_password, temp_password_expires, estado, order_id, created_at) VALUES (?, ?, ?, 1, ?, 1, ?, NOW())',
          [beneficiary_name || customer_name || 'Beneficiario', email_destinatario, tempPassword, tempExpires, orderId]
        );
      }

      // Usuario app (opcional, mantener compatibilidad actual): buscar si existe usuario por gmail o usuario
      const [users] = await pool.query(
        'SELECT id, password FROM usuarios WHERE gmail = ? OR usuario = ? LIMIT 1',
        [email_destinatario, email_destinatario]
      );
      if (users.length > 0) {
        // Reusar contraseña existente del usuario si existe
        if (users[0].password) {
          tempPassword = users[0].password;
        }
        // No sobrescribimos password; solo activamos el estado
        await pool.query(
          'UPDATE usuarios SET estado = 1 WHERE id = ?',
          [users[0].id]
        );
      } else {
        await pool.query(
          'INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, foto, estado, ultimo_login, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [customer_name || 'Cliente', email_destinatario, email_destinatario, tempPassword, 'user', '', 1]
        );
      }
    } catch (e) {
      console.error('⚠️ No se pudo sincronizar usuario/clave temporal:', e.message);
    }

    // Intentar enviar email de comprobante
    try {
      console.log('🔄 Intentando enviar email a:', email_destinatario);
      const emailResult = await sendReceiptEmail({
        to: email_destinatario,
        purchaseData: {
          amount: monto,
          orderNumber: order_id,
          customerName: customer_name || 'Cliente'
        },
        transactionId: order_id,
        qrDataURL: qrCodeDataURL,
        tempPassword
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
  beneficiary_name: beneficiary_name || customer_name || 'Beneficiario',
        qr_code: qrCodeDataURL,
        receipt_url: `/receipt/${order_id}`,
        email_enviado: emailSent,
        email_error: emailError,
  order_id: orderId,
  temp_password: tempPassword
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