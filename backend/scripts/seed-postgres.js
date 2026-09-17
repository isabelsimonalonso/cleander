require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:waa7lfmmXy4R92IX@db.ldsaeokmzadlsqzqanib.supabase.co:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando seed de datos de demostración...\n');

    // Limpiar usuarios anteriores (excepto admin)
    await client.query("DELETE FROM usuarios WHERE email NOT LIKE 'admin%'");
    console.log('🗑️  Tabla limpiada\n');

    // Contraseña demo (mínimo 12 caracteres)
    const passwordHash = bcrypt.hashSync('DemoPassword123', 10);

    // URLs de fotos de demo
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
    for (let idx = 0; idx < clientesData.length; idx++) {
      const cliente = clientesData[idx];
      const result = await client.query(
        `INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [cliente.nombre, cliente.email, cliente.telefono, 'CLIENTE', fotosClientes[idx], 1, 1, 1, passwordHash]
      );
      clienteIds.push(result.rows[0].id);
      console.log(`  ✅ ${cliente.nombre} (${cliente.email})`);
    }

    // ============= CREAR PROFESIONALES =============
    console.log('\n👨‍🔧 Creando profesionales de demostración...');
    const profesionalesData = [
      { nombre: 'Carlos López', email: 'carlos@demo.com', telefono: '600444444', precio: 25, experiencia: 'EXPERTO', servicios: [1, 2] },
      { nombre: 'Elena Fernández', email: 'elena@demo.com', telefono: '600555555', precio: 35, experiencia: 'INTERMEDIO', servicios: [2, 3] },
      { nombre: 'Miguel Rodríguez', email: 'miguel@demo.com', telefono: '600666666', precio: 20, experiencia: 'PRINCIPIANTE', servicios: [1, 4] },
      { nombre: 'Isabel Gutiérrez', email: 'isabel@demo.com', telefono: '600777777', precio: 40, experiencia: 'EXPERTO', servicios: [3] },
    ];

    const profesionalIds = [];
    for (let idx = 0; idx < profesionalesData.length; idx++) {
      const prof = profesionalesData[idx];
      const usuarioResult = await client.query(
        `INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [prof.nombre, prof.email, prof.telefono, 'PROFESIONAL', fotosProfesionales[idx], 1, 1, 1, passwordHash]
      );

      const usuarioId = usuarioResult.rows[0].id;

      // Crear registro en tabla profesionales
      const profResult = await client.query(
        `INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [usuarioId, prof.precio, prof.experiencia, 1]
      );

      const profesionalId = profResult.rows[0].id;
      profesionalIds.push(profesionalId);

      // Asignar servicios
      for (const servicioId of prof.servicios) {
        await client.query(
          `INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES ($1, $2)`,
          [profesionalId, servicioId]
        );
      }

      console.log(`  ✅ ${prof.nombre} (${prof.email}) - €${prof.precio}/h - ${prof.experiencia}`);
    }

    // ============= CREAR MATCHES DE DEMO =============
    console.log('\n🔗 Creando matches de demostración...');

    // María solicita match a Carlos
    await client.query(
      `INSERT INTO matches (cliente_id, profesional_id, estado) VALUES ($1, $2, $3)`,
      [clienteIds[0], profesionalIds[0], 'PENDIENTE']
    );
    console.log(`  ✅ María → Carlos (PENDIENTE)`);

    // Juan solicita match a Elena (ACEPTADO)
    await client.query(
      `INSERT INTO matches (cliente_id, profesional_id, estado) VALUES ($1, $2, $3)`,
      [clienteIds[1], profesionalIds[1], 'ACEPTADO']
    );
    console.log(`  ✅ Juan → Elena (ACEPTADO - pueden ver contacto)`);

    // Ana solicita match a Miguel
    await client.query(
      `INSERT INTO matches (cliente_id, profesional_id, estado) VALUES ($1, $2, $3)`,
      [clienteIds[2], profesionalIds[2], 'PENDIENTE']
    );
    console.log(`  ✅ Ana → Miguel (PENDIENTE)`);

    // ============= CREAR RESEÑA DE DEMO =============
    console.log('\n⭐ Creando reseñas de demostración...');
    await client.query(
      `INSERT INTO resenas (profesional_id, cliente_id, puntuacion, comentario) VALUES ($1, $2, $3, $4)`,
      [profesionalIds[1], clienteIds[1], 5, 'Excelente trabajo, muy profesional']
    );
    console.log(`  ✅ Juan ha dejado 5⭐ a Elena`);

    // Actualizar valoración media
    await client.query(
      `UPDATE profesionales SET valoracion_media = 5, total_resenas = 1 WHERE id = $1`,
      [profesionalIds[1]]
    );

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

    console.log('\n🚀 Prueba: https://cleander-seven.vercel.app\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
