// 🚨 SCRIPT DE DEBUG PARA TU COMPAÑERO
// Pegar este código en la consola del navegador (F12) cuando esté en /profile

console.log('🔍 INICIANDO DEBUG DEL PERFIL...\n');

// 1. Verificar datos en localStorage
const currentUser = localStorage.getItem('currentUser');
console.log('👤 Datos en localStorage:');
if (currentUser) {
    const userData = JSON.parse(currentUser);
    console.table(userData);
    console.log(`✅ User ID encontrado: ${userData.id}`);
    console.log(`✅ Email: ${userData.gmail || userData.usuario}`);
} else {
    console.error('❌ NO HAY DATOS DE USUARIO EN LOCALSTORAGE');
    console.log('🔧 SOLUCIÓN: Vuelve a hacer login');
}

// 2. Probar llamada a la API de órdenes
if (currentUser) {
    const userData = JSON.parse(currentUser);
    const userId = userData.id;
    
    console.log('\n🔍 Probando API de órdenes...');
    
    // Probar órdenes
    fetch(`/api/orders?userId=${userId}&type=orders`)
        .then(response => response.json())
        .then(data => {
            console.log('\n📦 Respuesta API órdenes:');
            console.log(data);
            if (data.success && data.data) {
                console.log(`✅ Se encontraron ${data.data.length} órdenes`);
                if (data.data.length > 0) {
                    console.table(data.data.slice(0, 3)); // Mostrar solo las primeras 3
                }
            } else {
                console.error('❌ Error en API de órdenes:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Error de red en API de órdenes:', error);
        });
    
    // Probar gift cards
    fetch(`/api/orders?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('\n🎁 Respuesta API gift cards:');
            console.log(data);
            if (data.success && data.data) {
                console.log(`✅ Se encontraron ${data.data.length} gift cards`);
                if (data.data.length > 0) {
                    console.table(data.data.slice(0, 3)); // Mostrar solo las primeras 3
                }
            } else {
                console.error('❌ Error en API de gift cards:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Error de red en API de gift cards:', error);
        });
    
    // Probar API de saldo
    const emailToTest = userData.gmail || userData.usuario;
    fetch(`/api/gift-cards/saldo?email=${encodeURIComponent(emailToTest)}`)
        .then(response => response.json())
        .then(data => {
            console.log('\n💰 Respuesta API saldo:');
            console.log(data);
            if (data.success) {
                console.log(`✅ Saldo total: $${data.saldoTotal}`);
                console.log(`✅ Puntos: ${data.userStats?.points || 0}`);
                console.log(`✅ Gift cards encontradas: ${data.giftCards?.length || 0}`);
            } else {
                console.error('❌ Error en API de saldo:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Error de red en API de saldo:', error);
        });
}

// 3. Verificar estado de la página
console.log('\n📄 Estado actual de la página:');
console.log('URL actual:', window.location.href);
console.log('Título:', document.title);

// Buscar elementos del perfil
const profileElements = document.querySelectorAll('[data-testid], .profile, .user-stats, .gift-cards, .orders');
console.log(`Elementos de perfil encontrados: ${profileElements.length}`);

setTimeout(() => {
    console.log('\n✅ DEBUG COMPLETADO');
    console.log('Si ves errores arriba, ese es el problema que hay que solucionar');
    console.log('Si todo está bien, es posible que sea un problema de cache del navegador');
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('1. Cerrar sesión y volver a entrar');
    console.log('2. Limpiar localStorage: localStorage.clear()');
    console.log('3. Refrescar la página (Ctrl+F5)');
    console.log('4. Abrir en ventana privada/incógnito');
}, 2000);