import pool from '../../../../utils/db.ts';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

// Función para enviar email de comprobante con diseño profesional premium
async function sendReceiptEmail({ to, purchaseData, transactionId, qrDataURL }) {
  try {
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
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comprobante de Compra</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px 15px;
              min-height: 100vh;
            }
            
            .email-wrapper {
              max-width: 650px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
              position: relative;
            }
            
            .email-wrapper::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
            }
            
            .header {
              background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="25" r="0.5" fill="white" opacity="0.05"/><circle cx="25" cy="75" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              animation: float 20s infinite linear;
            }
            
            @keyframes float {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            .logo-section {
              position: relative;
              z-index: 2;
            }
            
            .company-logo {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: 2px;
              background: linear-gradient(45deg, #ffffff, #e2e8f0);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            .header h1 {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 8px;
              opacity: 0.95;
            }
            
            .header p {
              font-size: 16px;
              opacity: 0.8;
              font-weight: 300;
            }
            
            .main-container {
              padding: 0;
            }
            
            .receipt-card {
              margin: 30px;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
              border: 1px solid #f1f5f9;
            }
            
            .receipt-header {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 25px 30px;
              border-bottom: 2px solid #e2e8f0;
            }
            
            .receipt-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .order-number {
              font-size: 18px;
              font-weight: 700;
              color: #1e293b;
            }
            
            .order-date {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
            }
            
            .receipt-body {
              display: grid;
              grid-template-columns: 1fr 200px;
              gap: 30px;
              padding: 30px;
            }
            
            .purchase-details {
              space-y: 20px;
            }
            
            .detail-group {
              margin-bottom: 20px;
            }
            
            .detail-title {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .detail-value {
              font-size: 16px;
              color: #1e293b;
              font-weight: 600;
            }
            
            .amount-section {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              padding: 20px;
              border-radius: 12px;
              margin-top: 20px;
              border-left: 4px solid #10b981;
            }
            
            .amount-label {
              font-size: 14px;
              color: #065f46;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .amount-value {
              font-size: 28px;
              color: #047857;
              font-weight: 700;
            }
            
            .qr-container {
              text-align: center;
              padding: 25px 20px;
              background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
              border-radius: 16px;
              border: 2px dashed #d4d4d8;
            }
            
            .qr-title {
              font-size: 14px;
              color: #52525b;
              font-weight: 600;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .qr-code {
              width: 150px;
              height: 150px;
              margin: 0 auto 15px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              border: 3px solid #ffffff;
            }
            
            .qr-description {
              font-size: 12px;
              color: #71717a;
              line-height: 1.4;
            }
            
            .status-badge {
              display: inline-flex;
              align-items: center;
              background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
              color: #166534;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border: 1px solid #bbf7d0;
            }
            
            .status-badge::before {
              content: '✓';
              margin-right: 6px;
              font-weight: 700;
            }
            
            .actions-section {
              grid-column: 1 / -1;
              margin-top: 20px;
              text-align: center;
              padding: 25px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 16px;
            }
            
            .action-buttons {
              display: flex;
              gap: 15px;
              justify-content: center;
              margin-bottom: 20px;
            }
            
            .btn-primary {
              display: inline-flex;
              align-items: center;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
              border: none;
            }
            
            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
            }
            
            .btn-secondary {
              display: inline-flex;
              align-items: center;
              background: #ffffff;
              color: #475569;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 14px;
              border: 2px solid #e2e8f0;
              transition: all 0.3s ease;
            }
            
            .btn-secondary:hover {
              background: #f8fafc;
              border-color: #cbd5e1;
              transform: translateY(-1px);
            }
            
            .btn-icon {
              margin-right: 8px;
              font-size: 16px;
            }
            
            .security-note {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              border: 1px solid #bfdbfe;
              border-radius: 12px;
              padding: 20px;
              margin-top: 15px;
            }
            
            .security-note h4 {
              color: #1e40af;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
            }
            
            .security-note h4::before {
              content: '🔒';
              margin-right: 8px;
            }
            
            .security-list {
              font-size: 13px;
              color: #374151;
              line-height: 1.6;
            }
            
            .security-list li {
              margin-bottom: 6px;
              padding-left: 20px;
              position: relative;
            }
            
            .security-list li::before {
              content: '•';
              color: #3b82f6;
              font-weight: 700;
              position: absolute;
              left: 0;
            }
            
            .footer {
              background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
              padding: 30px;
              text-align: center;
              color: white;
            }
            
            .footer-content {
              max-width: 500px;
              margin: 0 auto;
            }
            
            .footer h3 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 12px;
            }
            
            .footer p {
              font-size: 14px;
              opacity: 0.8;
              line-height: 1.6;
              margin-bottom: 8px;
            }
            
            .footer-links {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .footer-links a {
              color: #94a3b8;
              text-decoration: none;
              font-size: 13px;
              margin: 0 15px;
              transition: color 0.3s ease;
            }
            
            .footer-links a:hover {
              color: #ffffff;
            }
            
            @media (max-width: 768px) {
              body {
                padding: 15px 10px;
              }
              
              .email-wrapper {
                margin: 0;
                border-radius: 16px;
              }
              
              .receipt-card {
                margin: 20px 15px;
              }
              
              .receipt-body {
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 25px 20px;
              }
              
              .qr-container {
                order: -1;
              }
              
              .action-buttons {
                flex-direction: column;
              }
              
              .btn-primary, .btn-secondary {
                width: 100%;
                justify-content: center;
              }
              
              .header, .footer {
                padding: 25px 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            
            <!-- Header -->
            <div class="header">
              <div class="logo-section">
                <div class="company-logo">MLine</div>
                <h1>Comprobante de Compra</h1>
                <p>Transacción procesada exitosamente</p>
              </div>
            </div>

            <!-- Main Container -->
            <div class="main-container">
              
              <!-- Receipt Card -->
              <div class="receipt-card">
                
                <!-- Receipt Header -->
                <div class="receipt-header">
                  <div class="receipt-info">
                    <div>
                      <div class="order-number">Orden #${transactionId}</div>
                      <div class="status-badge">Pagado</div>
                    </div>
                    <div class="order-date">
                      ${new Date().toLocaleDateString('es-ES', { 
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <!-- Receipt Body -->
                <div class="receipt-body">
                  
                  <!-- Purchase Details -->
                  <div class="purchase-details">
                    
                    <div class="detail-group">
                      <div class="detail-title">Cliente</div>
                      <div class="detail-value">${purchaseData.customerName}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-title">Email</div>
                      <div class="detail-value">${to}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-title">Método de Pago</div>
                      <div class="detail-value">Webpay Plus</div>
                    </div>
                    
                    <div class="amount-section">
                      <div class="amount-label">Total Pagado</div>
                      <div class="amount-value">$${purchaseData.amount.toLocaleString('es-CL')}</div>
                    </div>
                    
                  </div>

                  <!-- QR Code Section -->
                  <div class="qr-container">
                    <div class="qr-title">Verificación</div>
                    <img src="cid:qr-code" 
                         alt="Código QR de verificación" 
                         class="qr-code" />
                    <div class="qr-description">
                      Escanea para verificar la autenticidad de este comprobante
                    </div>
                  </div>

                  <!-- Actions Section -->
                  <div class="actions-section">
                    <div class="action-buttons">
                      <a href="http://localhost:3000/receipt/${purchaseData.orderNumber}" 
                         class="btn-primary"
                         style="color: white; text-decoration: none;">
                        <span class="btn-icon">📄</span>
                        Ver Comprobante Completo
                      </a>
                      
                      <a href="http://localhost:3000/receipt/${purchaseData.orderNumber}?print=true" 
                         class="btn-secondary"
                         style="color: #475569; text-decoration: none;">
                        <span class="btn-icon">🖨️</span>
                        Imprimir Comprobante
                      </a>
                    </div>

                    <!-- Security Note -->
                    <div class="security-note">
                      <h4>Información de Seguridad</h4>
                      <ul class="security-list">
                        <li>Este comprobante es válido para reclamos y consultas</li>
                        <li>Verificación disponible mediante código QR</li>
                        <li>Conserva este email como respaldo oficial</li>
                        <li>Cualquier duda, contacta a nuestro equipo de soporte</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <h3>Gracias por confiar en MLine</h3>
                <p>Tu compra ha sido procesada exitosamente y está lista para usar.</p>
                <p>Este es un mensaje automático, por favor no responder directamente.</p>
                
                <div class="footer-links">
                  <a href="#">Soporte</a>
                  <a href="#">Términos</a>
                  <a href="#">Privacidad</a>
                  <a href="#">Contacto</a>
                </div>
              </div>
            </div>

          </div>
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
    console.error('❌ Error enviando email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function POST(request) {
  try {
    const { order_id, monto, email_destinatario, customer_name } = await request.json();

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