// Script para eliminar las tablas de auditoría creadas anteriormente
const { query } = require('../src/config/database');

async function cleanupAuditTables() {
  console.log('🧹 Limpiando tablas de auditoría no necesarias...');

  try {
    // Eliminar tablas de auditoría
    const tablesToDrop = ['qr_audit', 'email_audit', 'purchase_history', 'gift_card_summary'];
    
    for (const table of tablesToDrop) {
      try {
        await query(`DROP VIEW IF EXISTS ${table}`);
        await query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Eliminada tabla/vista: ${table}`);
      } catch (error) {
        console.log(`ℹ️ Tabla ${table} no existía o ya fue eliminada`);
      }
    }

    console.log('🎉 ¡Limpieza completada! Solo quedaron las tablas originales: gift_cards y orders');

  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
    process.exit(1);
  }
}

cleanupAuditTables()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
