// Script temporal para consultar información de la institución Liceo
// Ejecutar con: node test-backend-liceo.js

const API_URL = 'http://localhost:3333';

async function consultarInstitucionLiceo() {
  console.log('🔍 Consultando información de la institución Liceo...\n');
  
  try {
    // 1. Obtener todas las instituciones
    console.log('📋 1. Obteniendo todas las instituciones...');
    const instResponse = await fetch(`${API_URL}/instituciones`);
    const instituciones = await instResponse.json();
    console.log('Instituciones encontradas:', JSON.stringify(instituciones, null, 2));
    
    // Buscar Liceo
    const liceo = instituciones.data?.find(i => 
      i.nombre?.toLowerCase().includes('liceo')
    );
    
    if (!liceo) {
      console.log('❌ No se encontró la institución Liceo');
      return;
    }
    
    console.log('\n✅ Institución Liceo encontrada:');
    console.log(JSON.stringify(liceo, null, 2));
    const liceoId = liceo.id;
    
    // 2. Obtener estudiantes
    console.log('\n📚 2. Obteniendo estudiantes...');
    const estudiantesResponse = await fetch(`${API_URL}/estudiantes`);
    const estudiantes = await estudiantesResponse.json();
    console.log('Total estudiantes:', estudiantes.data?.length || 0);
    console.log('Estudiantes:', JSON.stringify(estudiantes, null, 2));
    
    // 3. Obtener cursos
    console.log('\n📖 3. Obteniendo cursos...');
    const cursosResponse = await fetch(`${API_URL}/cursos`);
    const cursos = await cursosResponse.json();
    console.log('Total cursos:', cursos.data?.length || 0);
    console.log('Cursos:', JSON.stringify(cursos, null, 2));
    
    // 4. Obtener grados
    console.log('\n🎓 4. Obteniendo grados...');
    const gradosResponse = await fetch(`${API_URL}/grados`);
    const grados = await gradosResponse.json();
    console.log('Total grados:', grados.data?.length || 0);
    console.log('Grados:', JSON.stringify(grados, null, 2));
    
    // 5. Obtener docentes
    console.log('\n👨‍🏫 5. Obteniendo docentes...');
    const docentesResponse = await fetch(`${API_URL}/docentes`);
    const docentes = await docentesResponse.json();
    console.log('Total docentes:', docentes.data?.length || 0);
    console.log('Docentes:', JSON.stringify(docentes, null, 2));
    
    // 6. Obtener acudientes
    console.log('\n👨‍👩‍👧 6. Obteniendo acudientes...');
    const acudientesResponse = await fetch(`${API_URL}/acudientes`);
    const acudientes = await acudientesResponse.json();
    console.log('Total acudientes:', acudientes.data?.length || 0);
    console.log('Acudientes:', JSON.stringify(acudientes, null, 2));
    
    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE LA INSTITUCIÓN LICEO');
    console.log('='.repeat(60));
    console.log(`🏫 Nombre: ${liceo.nombre}`);
    console.log(`🆔 ID: ${liceoId}`);
    console.log(`📚 Estudiantes: ${estudiantes.data?.length || 0}`);
    console.log(`📖 Cursos: ${cursos.data?.length || 0}`);
    console.log(`🎓 Grados: ${grados.data?.length || 0}`);
    console.log(`👨‍🏫 Docentes: ${docentes.data?.length || 0}`);
    console.log(`👨‍👩‍👧 Acudientes: ${acudientes.data?.length || 0}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error al consultar el backend:', error.message);
    console.error('Stack:', error.stack);
  }
}

consultarInstitucionLiceo();
