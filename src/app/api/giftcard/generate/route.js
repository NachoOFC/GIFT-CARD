import pool from '@/utils/db';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { validateEmail, detectSuspiciousEmail } from '@/utils/emailValidation';

  // Función para enviar email de comprobante con diseño profesional premium
async function sendReceiptEmail({ to, purchaseData, transactionId, qrDataURL, tempPassword }) {
  try {
    // Importar la plantilla de email desde el archivo separado
    // Nota: importamos de forma dinámica para evitar problemas con Next.js y para mantener la compatibilidad
    const receiptEmailTemplateModule = await import('@/templates/emails/receipt');
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
  const { order_id, monto, email_destinatario, customer_name, beneficiary_name, email_comprador } = await request.json();

    // Validar parámetros requeridos
    if (!order_id || !monto || !email_destinatario) {
      return Response.json({
        success: false,
        error: 'Parámetros requeridos: order_id, monto, email_destinatario'
      }, { status: 400 });
    }

    // Validar email del destinatario
    const emailValidation = validateEmail(email_destinatario);
    if (!emailValidation.isValid) {
      console.error('❌ Email destinatario inválido:', email_destinatario, emailValidation.error);
      return Response.json({
        success: false,
        error: `Email destinatario inválido: ${emailValidation.error}`,
        suggestion: emailValidation.suggestion
      }, { status: 400 });
    }

    // Validar email del comprador si se proporciona
    if (email_comprador) {
      const buyerEmailValidation = validateEmail(email_comprador);
      if (!buyerEmailValidation.isValid) {
        console.error('❌ Email comprador inválido:', email_comprador, buyerEmailValidation.error);
        return Response.json({
          success: false,
          error: `Email comprador inválido: ${buyerEmailValidation.error}`,
          suggestion: buyerEmailValidation.suggestion
        }, { status: 400 });
      }
    }

    // Advertir sobre emails sospechosos
    if (detectSuspiciousEmail(email_destinatario)) {
      console.warn('⚠️ Email destinatario sospechoso:', email_destinatario);
    }

    // Si no se especifica email_comprador, asumimos que el destinatario es quien compra
    const emailComprador = email_comprador || email_destinatario;
    
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
      emailComprador, // Email del comprador
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
      // ✅ PRIMERO: Verificar si el beneficiario ya tiene usuario en el sistema
      const [existingBeneficiaryUsers] = await pool.query(
        'SELECT id, password FROM usuarios WHERE gmail = ? LIMIT 1',
        [email_destinatario]
      );

      // Solo crear/actualizar beneficiarios si NO tiene usuario ya creado
      if (existingBeneficiaryUsers.length === 0) {
        // Beneficiario: upsert por email (SOLO si no tiene usuario)
        const [benRows] = await pool.query(
          'SELECT id, temp_password FROM beneficiarios WHERE email = ? LIMIT 1',
          [email_destinatario]
        );
        
        if (benRows.length > 0) {
          // Beneficiario existe, reusar contraseña
          if (benRows[0].temp_password) {
            tempPassword = benRows[0].temp_password;
          }
          await pool.query(
            'UPDATE beneficiarios SET nombre = ?, estado = 1, order_id = ? WHERE id = ?',
            [beneficiary_name || customer_name || 'Beneficiario', orderId, benRows[0].id]
          );
        } else {
          // Crear nuevo beneficiario
          await pool.query(
            'INSERT INTO beneficiarios (nombre, email, temp_password, must_change_password, temp_password_expires, estado, order_id, created_at) VALUES (?, ?, ?, 1, ?, 1, ?, NOW())',
            [beneficiary_name || customer_name || 'Beneficiario', email_destinatario, tempPassword, tempExpires, orderId]
          );
        }

        // Crear usuario automáticamente para beneficiario nuevo
        const userName = email_destinatario.split('@')[0];
        const fullName = beneficiary_name || customer_name || 'Usuario Beneficiario';
        
        console.log(`🆕 Creando usuario automático para beneficiario: ${email_destinatario}`);
        
        await pool.query(
          `INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion, fecha_registro) 
           VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())`,
          [fullName, userName, email_destinatario, tempPassword]
        );
        
        console.log(`✅ Usuario creado: ${userName} con contraseña temporal`);
      } else {
        // ✅ Usuario beneficiario YA EXISTE - no crear contraseña temporal
        console.log(`✅ Usuario beneficiario ya existe: ${email_destinatario} - NO se modifica contraseña`);
        tempPassword = null; // No enviar contraseña en email si ya tiene cuenta
        
        // Solo activar si está inactivo
        await pool.query(
          'UPDATE usuarios SET estado = 1 WHERE id = ?',
          [existingBeneficiaryUsers[0].id]
        );
      }
    } catch (e) {
      console.error('⚠️ No se pudo sincronizar usuario/clave temporal:', e.message);
    }

    // ✅ VERIFICAR USUARIO DEL COMPRADOR (solo si es diferente al beneficiario)
    try {
      if (emailComprador !== email_destinatario) {
        console.log(`👤 Verificando usuario comprador: ${emailComprador}`);
        const [existingBuyer] = await pool.query(
          'SELECT id FROM usuarios WHERE gmail = ? LIMIT 1',
          [emailComprador]
        );

        if (existingBuyer.length === 0) {
          // Solo crear usuario comprador si NO existe
          const buyerUserName = emailComprador.split('@')[0];
          const buyerFullName = customer_name || 'Comprador';
          
          console.log(`🆕 Creando usuario comprador: ${emailComprador}`);
          
          await pool.query(
            `INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion, fecha_registro) 
             VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())`,
            [buyerFullName, buyerUserName, emailComprador, generateTempPassword(8)]
          );
          
          console.log(`✅ Usuario comprador creado: ${buyerUserName}`);
        } else {
          console.log(`✅ Usuario comprador ya existe: ${emailComprador} - NO se modifica`);
          // Solo activar si está inactivo
          await pool.query(
            'UPDATE usuarios SET estado = 1 WHERE id = ?',
            [existingBuyer[0].id]
          );
        }
      } else {
        console.log(`👤 Comprador y beneficiario son el mismo usuario: ${emailComprador}`);
      }
    } catch (e) {
      console.error('⚠️ Error verificando usuario comprador:', e.message);
    }

    // ✅ CREAR GIFT CARDS Y RELACIONES CON USUARIOS
    try {
      // Obtener usuarios beneficiario y comprador
      const [beneficiaryUser] = await pool.query(
        'SELECT id FROM usuarios WHERE gmail = ? LIMIT 1',
        [email_destinatario]
      );

      const [buyerUser] = await pool.query(
        'SELECT id FROM usuarios WHERE gmail = ? LIMIT 1', 
        [emailComprador]
      );

      if (beneficiaryUser.length > 0) {
        const beneficiaryUserId = beneficiaryUser[0].id;
        const buyerUserId = buyerUser.length > 0 ? buyerUser[0].id : null;

        console.log(`🔍 Usuario beneficiario: ${beneficiaryUserId} (${email_destinatario})`);
        console.log(`🔍 Usuario comprador: ${buyerUserId || 'NO ENCONTRADO'} (${emailComprador})`);

        // Crear gift card individual
        const giftCardCode = `GC-${order_id}-${Date.now().toString().slice(-4)}`;
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 año de expiración

        await pool.query(`
          INSERT INTO gift_cards (codigo, valor_inicial, saldo_actual, activa, fecha_expiracion, email_destinatario, empresa, mensaje, order_id)
          VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)
        `, [
          giftCardCode,
          monto,
          monto,
          expirationDate.toISOString().split('T')[0],
          email_destinatario,
          'MLine',
          `Gift Card por compra #${order_id}`,
          orderId
        ]);

        console.log(`✅ Gift card creada: ${giftCardCode} por $${monto}`);

        // Determinar si es autocompra (mismo email) o compra para otro
        const isAutoCompra = emailComprador === email_destinatario;
        console.log(`🎯 ¿Es autocompra?: ${isAutoCompra ? 'SÍ' : 'NO'}`);

        // Si es autocompra Y ambos tienen cuenta: crear UNA relación con ambos roles
        if (isAutoCompra && buyerUserId && buyerUserId === beneficiaryUserId) {
          await pool.query(`
            INSERT INTO user_orders (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo)
            VALUES (?, ?, ?, ?, NOW(), 'active', 'comprador_beneficiario')
          `, [
            beneficiaryUserId,
            orderId,
            giftCardCode,
            monto
          ]);

          console.log(`✅ AUTOCOMPRA: Usuario ${beneficiaryUserId} es comprador Y beneficiario`);
        } else {
          // Compra para OTRA PERSONA o comprador sin cuenta
          
          // SIEMPRE crear registro para beneficiario (tiene la gift card)
          await pool.query(`
            INSERT INTO user_orders (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo)
            VALUES (?, ?, ?, ?, NOW(), 'active', 'beneficiario')
          `, [
            beneficiaryUserId,
            orderId,
            giftCardCode,
            0 // Beneficiario NO pagó nada, solo recibió la gift card
          ]);

          console.log(`✅ BENEFICIARIO ${beneficiaryUserId}: tiene gift card ${giftCardCode} (sin costo)`);

          // Solo crear registro para comprador SI tiene cuenta registrada
          if (buyerUserId && buyerUserId !== beneficiaryUserId) {
            await pool.query(`
              INSERT INTO user_orders (user_id, order_id, gift_card_codes, total_amount, purchase_date, status, tipo)
              VALUES (?, ?, ?, ?, NOW(), 'active', 'comprador')
            `, [
              buyerUserId,
              orderId,
              null, // No tiene acceso a la gift card
              monto // El comprador SÍ pagó este monto
            ]);

            console.log(`✅ COMPRADOR ${buyerUserId}: solo historial de compra por $${monto}`);
          } else if (!buyerUserId) {
            console.log(`⚠️ COMPRADOR SIN CUENTA: ${emailComprador} - no se crea registro en user_orders`);
          }
        }

      } else {
        console.log('⚠️ No se pudo encontrar usuario beneficiario para crear gift card');
      }
    } catch (e) {
      console.error('⚠️ Error creando gift card o relaciones user_orders:', e.message);
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