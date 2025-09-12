echo "🧪 PROBANDO LÓGICA GIFT CARD: COMPRADOR vs BENEFICIARIO"
echo "============================================================="

echo ""
echo "📤 TEST 1: Comprador != Beneficiario"
echo "Enviando request..."

curl -s -X POST http://localhost:3000/api/giftcard/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"order_id\": \"ORDER-%time%-TEST1\", \"monto\": 15000, \"email_destinatario\": \"beneficiario@test.com\", \"email_comprador\": \"comprador@test.com\", \"customer_name\": \"Juan Comprador\", \"beneficiary_name\": \"María Beneficiaria\"}"

echo ""
echo "============================================================="

echo ""
echo "🔄 TEST 2: Comprador = Beneficiario (sin email_comprador)"
echo "Enviando request..."

curl -s -X POST http://localhost:3000/api/giftcard/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"order_id\": \"ORDER-%time%-TEST2\", \"monto\": 25000, \"email_destinatario\": \"mismo@test.com\", \"customer_name\": \"Carlos Mismo\", \"beneficiary_name\": \"Carlos Mismo\"}"

echo ""
echo "============================================================="
echo "✅ Tests completados - revisar logs del servidor para detalles"