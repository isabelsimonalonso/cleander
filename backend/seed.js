require('dotenv').config();
const db = require('./src/db/config');
const bcrypt = require('bcryptjs');
const { initDB } = require('./src/db/init');

async function seed() {
  try {
    console.log('🌱 Iniciando seed de datos de demostración...\n');

    // Inicializar BD
    initDB();

    // Limpiar usuarios anteriores (excepto admin)
    db.prepare("DELETE FROM usuarios WHERE email NOT LIKE 'admin%'").run();

    // Contraseña demo (mínimo 12 caracteres)
    const passwordHash = await bcrypt.hash('DemoPassword123', 12);

    // URLs de fotos de demo (usando placeholders de Lorem Picsum)
    const fotosClientes = [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
    ];

    const fotosProfesionales = [
      'https://i.pravatar.cc/150?img=10',
      'https://i.pravatar.cc/150?img=11',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=13',
    ];

    // ============= CREAR CLIENTES =============
    console.log('👤 Creando clientes de demostración...');
    const clientesData = [
      { nombre: 'María García', email: 'maria@demo.com', telefono: '600111111' },
      { nombre: 'Juan López', email: 'juan@demo.com', telefono: '600222222' },
      { nombre: 'Ana Martínez', email: 'ana@demo.com', telefono: '600333333' },
    ];

    const clienteIds = [];
    clientesData.forEach((cliente, idx) => {
      const result = db.prepare(`
        INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        cliente.nombre,
        cliente.email,
        cliente.telefono,
        'CLIENTE',
        fotosClientes[idx],
        1, // foto verificada
        1, // email verificado
        1, // telefono verificado
        passwordHash
      );
      clienteIds.push(result.lastInsertRowid);
      console.log(`  ✅ ${cliente.nombre} (${cliente.email})`);
    });

    // ============= CREAR PROFESIONALES =============
    console.log('\n👨‍🔧 Creando profesionales de demostración...');
    const profesionalesData = [
      { nombre: 'Carlos López', email: 'carlos@demo.com', telefono: '600444444', precio: 25, experiencia: 'EXPERTO', servicios: [1, 2] }, // Limpieza + Fontanería
      { nombre: 'Elena Fernández', email: 'elena@demo.com', telefono: '600555555', precio: 35, experiencia: 'INTERMEDIO', servicios: [2, 3] }, // Fontanería + Electricidad
      { nombre: 'Miguel Rodríguez', email: 'miguel@demo.com', telefono: '600666666', precio: 20, experiencia: 'PRINCIPIANTE', servicios: [1, 4] }, // Limpieza + Reparaciones
      { nombre: 'Isabel Gutiérrez', email: 'isabel@demo.com', telefono: '600777777', precio: 40, experiencia: 'EXPERTO', servicios: [3] }, // Electricidad
    ];

    const profesionalIds = [];
    profesionalesData.forEach((prof, idx) => {
      const usuarioResult = db.prepare(`
        INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        prof.nombre,
        prof.email,
        prof.telefono,
        'PROFESIONAL',
        fotosProfesionales[idx],
        1, // foto verificada
        1, // email verificado
        1, // telefono verificado
        passwordHash
      );

      const usuarioId = usuarioResult.lastInsertRowid;
      profesionalIds.push(usuarioId);

      // Crear registro en tabla profesionales
      const profResult = db.prepare(`
        INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones)
        VALUES (?, ?, ?, ?)
      `).run(usuarioId, prof.precio, prof.experiencia, 1);

      const profesionalId = profResult.lastInsertRowid;

      // Asignar servicios
      prof.servicios.forEach(servicioId => {
        db.prepare(`
          INSERT INTO profesional_servicios (profesional_id, servicio_id)
          VALUES (?, ?)
        `).run(profesionalId, servicioId);
      });

      console.log(`  ✅ ${prof.nombre} (${prof.email}) - €${prof.precio}/h - ${prof.experiencia}`);
    });

    // ============= CREAR MATCHES DE DEMO =============
    console.log('\n🔗 Creando matches de demostración...');

    // María solicita match a Carlos (Limpieza)
    db.prepare(`
      INSERT INTO matches (cliente_id, profesional_id, estado)
      VALUES (?, ?, ?)
    `).run(clienteIds[0], profesionalIds[0], 'PENDIENTE');
    console.log(`  ✅ María → Carlos (PENDIENTE)`);

    // Juan solicita match a Elena (Fontanería) y es ACEPTADO
    db.prepare(`
      INSERT INTO matches (cliente_id, profesional_id, estado)
      VALUES (?, ?, ?)
    `).run(clienteIds[1], profesionalIds[1], 'ACEPTADO');
    console.log(`  ✅ Juan → Elena (ACEPTADO - pueden ver contacto)`);

    // Ana solicita match a Miguel (Limpieza)
    db.prepare(`
      INSERT INTO matches (cliente_id, profesional_id, estado)
      VALUES (?, ?, ?)
    `).run(clienteIds[2], profesionalIds[2], 'PENDIENTE');
    console.log(`  ✅ Ana → Miguel (PENDIENTE)`);

    // ============= CREAR RESEÑA DE DEMO =============
    console.log('\n⭐ Creando reseñas de demostración...');
    db.prepare(`
      INSERT INTO resenas (profesional_id, cliente_id, puntuacion, comentario)
      VALUES (?, ?, ?, ?)
    `).run(profesionalIds[1], clienteIds[1], 5, 'Excelente trabajo, muy profesional');
    console.log(`  ✅ Juan ha dejado 5⭐ a Elena`);

    // Actualizar valoración media
    db.prepare(`
      UPDATE profesionales
      SET valoracion_media = 5, total_resenas = 1
      WHERE usuario_id = ?
    `).run(profesionalIds[1]);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED COMPLETADO - Usuarios de demostración creados');
    console.log('='.repeat(60));
    console.log('\n📋 CREDENCIALES PARA PRUEBAS:');
    console.log('   Contraseña para todos: DemoPassword123\n');

    console.log('👤 CLIENTES:');
    clientesData.forEach(c => console.log(`   • ${c.email}`));

    console.log('\n👨‍🔧 PROFESIONALES:');
    profesionalesData.forEach(p => console.log(`   • ${p.email}`));

    console.log('\n🔗 MATCHES LISTOS:');
    console.log('   • María (cliente) → Carlos (profesional) - PENDIENTE');
    console.log('   • Juan (cliente) → Elena (profesional) - ACEPTADO ✅');
    console.log('   • Ana (cliente) → Miguel (profesional) - PENDIENTE');

    console.log('\n🚀 Inicia servidores y prueba:');
    console.log('   1. Inicia backend: npm run dev');
    console.log('   2. Inicia frontend: npm run dev');
    console.log('   3. Prueba login con: maria@demo.com / DemoPassword123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  }
}

seed();
