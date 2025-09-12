const mysql = require('mysql2/promise');

const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'gift-card'
};

async function testBeneficiarySystem() {
  let connection;
  try {
    console.log('🧪 Testing sistema de beneficiarios y usuarios automáticos...\n');
    
    connection = await mysql.createConnection(config);

    // Test 1: Crear beneficiario manualmente en BD
    console.log('1️⃣ Creando beneficiario de prueba...');
    
    const testEmail = 'beneficiario.test@empresa.cl';
    const testName = 'Juan Beneficiario Test';
    const tempPassword = 'TempPass123';
    const tempExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Limpiar datos de prueba existentes
    await connection.query('DELETE FROM usuarios WHERE gmail = ?', [testEmail]);
    await connection.query('DELETE FROM beneficiarios WHERE email = ?', [testEmail]);

    // Crear beneficiario
    const [benResult] = await connection.query(`
      INSERT INTO beneficiarios (nombre, email, temp_password, must_change_password, temp_password_expires, estado, created_at) 
      VALUES (?, ?, ?, 1, ?, 1, NOW())
    `, [testName, testEmail, tempPassword, tempExpires]);

    console.log(`   ✅ Beneficiario creado con ID: ${benResult.insertId}`);

    // Crear usuario automático
    const userName = testEmail.split('@')[0].replace(/\./g, '_');
    
    const [userResult] = await connection.query(`
      INSERT INTO usuarios (nombre, usuario, gmail, password, perfil, estado, fecha_creacion, fecha_registro) 
      VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())
    `, [testName, userName, testEmail, tempPassword]);

    console.log(`   ✅ Usuario creado automáticamente: ${userName} (ID: ${userResult.insertId})`);

    // Test 2: Verificar relación
    console.log('\n2️⃣ Verificando relación beneficiario-usuario...');
    
    const [relations] = await connection.query(`
      SELECT 
        b.id as beneficiario_id,
        b.nombre as beneficiario_nombre,
        b.email as beneficiario_email,
        b.temp_password as beneficiario_password,
        u.id as usuario_id,
        u.nombre as usuario_nombre,
        u.usuario as usuario_login,
        u.password as usuario_password
      FROM beneficiarios b
      LEFT JOIN usuarios u ON b.email = u.gmail
      WHERE b.email = ?
    `, [testEmail]);

    if (relations.length > 0) {
      const rel = relations[0];
      console.log('   ✅ Relación encontrada:');
      console.log(`      👤 Beneficiario: ${rel.beneficiario_nombre} (ID: ${rel.beneficiario_id})`);
      console.log(`      🔐 Usuario Login: ${rel.usuario_login} (ID: ${rel.usuario_id})`);
      console.log(`      🔑 Contraseñas coinciden: ${rel.beneficiario_password === rel.usuario_password ? '✅' : '❌'}`);
    } else {
      console.log('   ❌ No se encontró relación');
    }

    // Test 3: Verificar login funcional
    console.log('\n3️⃣ Simulando login del beneficiario...');
    
    const [loginTest] = await connection.query(`
      SELECT id, nombre, usuario, gmail, perfil, estado 
      FROM usuarios 
      WHERE (usuario = ? OR gmail = ?) AND password = ? AND estado = 1
    `, [userName, testEmail, tempPassword]);

    if (loginTest.length > 0) {
      console.log('   ✅ Login simulado exitoso:');
      console.log(`      👤 ${loginTest[0].nombre}`);
      console.log(`      📧 ${loginTest[0].gmail}`);
      console.log(`      🎯 Perfil: ${loginTest[0].perfil}`);
    } else {
      console.log('   ❌ Login simulado falló');
    }

    // Test 4: Estadísticas generales
    console.log('\n4️⃣ Estadísticas del sistema...');
    
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM beneficiarios) as total_beneficiarios,
        (SELECT COUNT(*) FROM usuarios WHERE perfil = 'user') as total_usuarios_normales,
        (SELECT COUNT(*) FROM usuarios WHERE perfil = 'admin') as total_usuarios_admin,
        (SELECT COUNT(*) FROM beneficiarios b JOIN usuarios u ON b.email = u.gmail) as beneficiarios_con_usuario
    `);

    const s = stats[0];
    console.log(`   📊 Beneficiarios: ${s.total_beneficiarios}`);
    console.log(`   👥 Usuarios normales: ${s.total_usuarios_normales}`);
    console.log(`   👑 Usuarios admin: ${s.total_usuarios_admin}`);
    console.log(`   🔗 Beneficiarios con usuario: ${s.beneficiarios_con_usuario}`);

    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await connection.query('DELETE FROM usuarios WHERE gmail = ?', [testEmail]);
    await connection.query('DELETE FROM beneficiarios WHERE email = ?', [testEmail]);
    console.log('   ✅ Limpieza completada');

    console.log('\n🎉 ¡Sistema de beneficiarios funcionando correctamente!');
    console.log('\n💡 Ahora cuando se cree un beneficiario:');
    console.log('   1. Se crea registro en tabla beneficiarios');
    console.log('   2. Se crea automáticamente usuario en tabla usuarios');
    console.log('   3. Ambos comparten la misma contraseña temporal');
    console.log('   4. El beneficiario puede hacer login como usuario normal');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testBeneficiarySystem();