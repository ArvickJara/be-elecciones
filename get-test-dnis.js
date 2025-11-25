import 'dotenv/config';
import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function getDnisPrueba() {
    try {
        console.log('\n🔍 Obteniendo DNIs de prueba...\n');

        const result = await db.execute(`
            SELECT 
                e.numero_documento as dni,
                e.nombres,
                e.apellido_paterno,
                e.apellido_materno,
                pm.grado,
                pm.seccion,
                pm.nivel
            FROM estudiantes e
            JOIN padron_matricula pm ON e.id = pm.estudiante_id
            WHERE pm.anio = 2025
            LIMIT 10
        `);

        console.log('📝 DNIs disponibles para probar:\n');
        console.log('═'.repeat(70));

        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. DNI: ${row.dni}`);
            console.log(`   Nombre: ${row.nombres} ${row.apellido_paterno} ${row.apellido_materno}`);
            console.log(`   Grado: ${row.grado} ${row.seccion} - ${row.nivel}`);
            console.log('─'.repeat(70));
        });

        console.log('\n💡 Usa cualquiera de estos DNIs para probar el sistema');
        console.log('🌐 Ingresa a: http://localhost:5174\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

getDnisPrueba();
