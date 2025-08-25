const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testGiftCardsAPI() {
  console.log('🧪 Probando API de Gift Cards...\n');

  try {
    // 1. Obtener todas las gift cards
    console.log('1. Obteniendo gift cards existentes...');
    const getResponse = await fetch(`${BASE_URL}/gift-cards`);
    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log(`✅ Se encontraron ${getData.data.length} gift cards`);
      console.log('Gift cards:', getData.data.map(gc => ({ id: gc.id, codigo: gc.codigo, valor: gc.valor_inicial })));
    } else {
      console.log('❌ Error al obtener gift cards:', getData.message);
    }

    // 2. Verificar código duplicado
    console.log('\n2. Verificando código duplicado...');
    const checkResponse = await fetch(`${BASE_URL}/gift-cards?codigo=TEST-123`);
    const checkData = await checkResponse.json();
    
    if (checkData.success) {
      console.log(`✅ Verificación de código: ${checkData.exists ? 'existe' : 'no existe'}`);
    } else {
      console.log('❌ Error al verificar código:', checkData.message);
    }

    // 3. Crear nueva gift card
    console.log('\n3. Creando nueva gift card...');
    const newGiftCard = {
      codigo: 'TEST-' + Date.now(),
      valor_inicial: 1000,
      fecha_expiracion: '2025-12-31',
      email_destinatario: 'test@example.com',
      mensaje: 'Mensaje de prueba',
      empresa: 'Empresa Test'
    };

    const createResponse = await fetch(`${BASE_URL}/gift-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGiftCard),
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ Gift card creada exitosamente');
      console.log('ID:', createData.data.insertId);
      
      // 4. Obtener gift card específica
      console.log('\n4. Obteniendo gift card específica...');
      const getOneResponse = await fetch(`${BASE_URL}/gift-cards/${createData.data.insertId}`);
      const getOneData = await getOneResponse.json();
      
      if (getOneData.success) {
        console.log('✅ Gift card obtenida:', getOneData.data);
        
        // 5. Actualizar gift card
        console.log('\n5. Actualizando gift card...');
        const updateData = {
          ...newGiftCard,
          codigo: 'TEST-UPDATED-' + Date.now(),
          valor_inicial: 2000,
          mensaje: 'Mensaje actualizado'
        };

        const updateResponse = await fetch(`${BASE_URL}/gift-cards/${createData.data.insertId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
          console.log('✅ Gift card actualizada exitosamente');
          
          // 6. Eliminar gift card
          console.log('\n6. Eliminando gift card...');
          const deleteResponse = await fetch(`${BASE_URL}/gift-cards/${createData.data.insertId}`, {
            method: 'DELETE',
          });

          const deleteData = await deleteResponse.json();
          
          if (deleteData.success) {
            console.log('✅ Gift card eliminada exitosamente');
          } else {
            console.log('❌ Error al eliminar gift card:', deleteData.message);
          }
        } else {
          console.log('❌ Error al actualizar gift card:', updateResult.message);
        }
      } else {
        console.log('❌ Error al obtener gift card específica:', getOneData.message);
      }
    } else {
      console.log('❌ Error al crear gift card:', createData.message);
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }

  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar las pruebas
testGiftCardsAPI();
