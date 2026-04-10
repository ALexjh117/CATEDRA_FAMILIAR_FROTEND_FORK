// Script de prueba para el sistema de recuperación de contraseña
// Este script simula las llamadas a la API para verificar que todo funciona correctamente

const BASE_URL = 'http://localhost:3333';

async function testPasswordRecovery() {
  console.log('🔐 Iniciando prueba del sistema de recuperación de contraseña...\n');

  // Paso 1: Solicitar código OTP
  console.log('📧 Paso 1: Solicitando código OTP...');
  try {
    const response = await fetch(`${BASE_URL}/password-reset/solicitar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@ejemplo.com',
        tipo: 'email'
      })
    });

    const data = await response.json();
    console.log('✅ Respuesta:', data);
    
    if (data.success) {
      console.log('🎉 Código enviado exitosamente');
      console.log('📋 Destino:', data.data.destino);
      console.log('⏰ Expira en:', data.data.expiraEn);
      console.log('👤 Rol:', data.data.rol);
      
      // Extraer el código del mensaje (para desarrollo)
      const codigoMatch = data.message.match(/(\d{6})/);
      const codigo = codigoMatch ? codigoMatch[1] : '123456'; // fallback
      
      console.log('\n🔑 Código extraído:', codigo);
      
      // Paso 2: Verificar código sin cambiar contraseña
      console.log('\n🔍 Paso 2: Verificando código OTP...');
      const verifyResponse = await fetch(`${BASE_URL}/password-reset/verificar-codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: codigo,
          tipo: 'email'
        })
      });

      const verifyData = await verifyResponse.json();
      console.log('✅ Verificación:', verifyData);
      
      if (verifyData.success) {
        console.log('🎉 Código válido');
        
        // Paso 3: Verificar código y cambiar contraseña
        console.log('\n🔧 Paso 3: Cambiando contraseña...');
        const changeResponse = await fetch(`${BASE_URL}/password-reset/verificar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            codigo: codigo,
            nuevaContrasena: 'NuevaClave123!',
            tipo: 'email'
          })
        });

        const changeData = await changeResponse.json();
        console.log('✅ Cambio de contraseña:', changeData);
        
        if (changeData.success) {
          console.log('🎉 ¡Contraseña cambiada exitosamente!');
          console.log('📝 Mensaje:', changeData.message);
        } else {
          console.log('❌ Error al cambiar contraseña:', changeData.message);
        }
      } else {
        console.log('❌ Código inválido:', verifyData.message);
      }
    } else {
      console.log('❌ Error al enviar código:', data.message);
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }

  console.log('\n🏁 Prueba completada');
}

// Ejecutar la prueba
testPasswordRecovery();
