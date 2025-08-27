require('dotenv').config({ path: './.env.local' });

console.log('📧 Verificando configuración de email...\n');

console.log('📋 Variables de entorno:');
console.log(`  GMAIL_USER: ${process.env.GMAIL_USER || '[NO CONFIGURADO]'}`);
console.log(`  GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? 
  (process.env.GMAIL_APP_PASSWORD === 'tu-app-password-de-gmail' ? '[NO CONFIGURADO - USAR CONTRASEÑA REAL]' : '[CONFIGURADO ✅]') 
  : '[NO CONFIGURADO]'}`);

if (process.env.GMAIL_APP_PASSWORD === 'tu-app-password-de-gmail') {
  console.log('\n❌ PROBLEMA: Necesitas configurar la contraseña de aplicación real de Gmail');
  console.log('🔧 Pasos:');
  console.log('1. Ve a https://myaccount.google.com/security');
  console.log('2. Activa "Verificación en 2 pasos"');
  console.log('3. Genera una contraseña de aplicación');
  console.log('4. Copia la contraseña de 16 caracteres');
  console.log('5. Reemplaza "tu-app-password-de-gmail" con la contraseña real en .env.local');
} else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  console.log('\n✅ Configuración completa. El email debería funcionar.');
  console.log('💡 Ejecuta una compra en el carrito para probar el envío de email');
} else {
  console.log('\n❌ Configuración incompleta');
}
