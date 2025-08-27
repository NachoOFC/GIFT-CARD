📧 CONFIGURACIÓN DE GMAIL PARA ENVÍO AUTOMÁTICO
==================================================

🎯 OBJETIVO: Enviar emails automáticamente a cualquier destinatario

📋 PASOS DETALLADOS:

1. 🔐 ACCEDER A GMAIL:
   - Ve a la cuenta: moonsystemspv@gmail.com (o tu Gmail personal)
   - Inicia sesión

2. ⚙️ ACTIVAR VERIFICACIÓN EN 2 PASOS:
   - Ve a: https://myaccount.google.com/security
   - Busca "Verificación en 2 pasos"
   - Haz clic en "Empezar" y sigue los pasos
   - ✅ OBLIGATORIO para crear contraseñas de aplicación

3. 🔑 CREAR CONTRASEÑA DE APLICACIÓN:
   - En la misma página de seguridad
   - Busca "Contraseñas de aplicación"
   - Selecciona "Correo"
   - Nombre: "Gift Card System"
   - 📋 COPIA la contraseña de 16 caracteres (ej: "abcd efgh ijkl mnop")

4. 📝 ACTUALIZAR ARCHIVO .env.local:
   ```bash
   GMAIL_USER=moonsystemspv@gmail.com
   GMAIL_APP_PASSWORD=la-contraseña-de-16-caracteres-aqui
   ```

5. ✅ PROBAR EL SISTEMA:
   - Reinicia el servidor (npm run dev)
   - Ve al carrito: http://localhost:3000/cart
   - Escribe CUALQUIER email (tuyo, de un amigo, etc.)
   - Completa la compra
   - El email llegará al destinatario especificado

🎯 RESULTADO:
- El sistema enviará desde: moonsystemspv@gmail.com
- El email llegará a: cualquier-email@que-escribas.com
- Contenido: Comprobante con Gift Card y código QR

💡 IMPORTANTE:
- Solo necesitas configurar UNA CUENTA de Gmail (la que envía)
- Los emails pueden llegar a CUALQUIER destinatario
- Funciona con Gmail, Outlook, Yahoo, etc.

🧪 PRUEBA RÁPIDA:
- Usa tu email personal como destinatario para probar
- Verifica que llegue el comprobante
- Si llega, el sistema funciona para cualquier email
