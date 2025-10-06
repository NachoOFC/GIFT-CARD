// Script para verificar la configuración de Cloudinary
require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');

console.log('🔍 Verificando configuración de Cloudinary...\n');

// Mostrar variables de entorno (ocultando el secret)
console.log('📋 Variables de entorno:');
console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || '❌ NO CONFIGURADO'}`);
console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY || '❌ NO CONFIGURADO'}`);
console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
console.log(`   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '❌ NO CONFIGURADO'}\n`);

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Probar conexión
async function testCloudinary() {
  try {
    console.log('🔄 Probando conexión con Cloudinary...\n');
    
    // Intentar obtener información de la cuenta
    const result = await cloudinary.api.ping();
    
    console.log('✅ ¡Conexión exitosa con Cloudinary!');
    console.log('📊 Estado:', result.status);
    console.log('\n🎉 Cloudinary está configurado correctamente.\n');
    console.log('📁 Las imágenes se guardarán en:');
    console.log(`   https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/...\n`);
    
  } catch (error) {
    console.error('❌ Error conectando con Cloudinary:');
    console.error(`   ${error.message}\n`);
    
    if (error.http_code === 401) {
      console.log('⚠️  Credenciales incorrectas. Verifica:');
      console.log('   1. CLOUDINARY_API_KEY');
      console.log('   2. CLOUDINARY_API_SECRET');
      console.log('   3. CLOUDINARY_CLOUD_NAME\n');
    } else if (error.http_code === 404) {
      console.log('⚠️  Cloud name no encontrado. Verifica:');
      console.log('   CLOUDINARY_CLOUD_NAME\n');
    }
    
    process.exit(1);
  }
}

testCloudinary();
