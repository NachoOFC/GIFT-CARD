# 🌐 CONFIGURACIÓN PARA ACCESO REMOTO TEMPORAL
# ===================================================================
# OPCIÓN NGROK - Exponer servidor local a internet
# ===================================================================

echo "🚀 INSTALANDO NGROK PARA ACCESO REMOTO"
echo "======================================"

# 1. Descargar e instalar ngrok
# Ve a: https://ngrok.com/download
# O instala con: npm install -g ngrok

# 2. Crear cuenta gratuita en ngrok.com y obtener token

# 3. Ejecutar comandos:
echo ""
echo "📋 COMANDOS PARA EJECUTAR:"
echo ""
echo "1️⃣  Instalar ngrok:"
echo "    npm install -g ngrok"
echo ""
echo "2️⃣  Iniciar tu servidor Next.js:"
echo "    npm run dev"
echo ""
echo "3️⃣  En otra terminal, ejecutar ngrok:"
echo "    ngrok http 3000"
echo ""
echo "4️⃣  Ngrok te dará una URL pública como:"
echo "    https://abc123.ngrok.io"
echo ""
echo "5️⃣  Compartir esa URL con tus compañeros"
echo ""
echo "⚠️  NOTA: La URL cambia cada vez que reinicies ngrok"
echo "⚠️  Para URL fija necesitas cuenta premium de ngrok"
echo ""
echo "🔒 CONSIDERACIONES DE SEGURIDAD:"
echo "   - Solo para desarrollo/pruebas"
echo "   - No usar en producción"
echo "   - La URL es pública en internet"
echo ""