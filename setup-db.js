import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setupDatabase() {
    try {
        console.log('📦 Configurando base de datos...\n');

        // Crear tabla de candidatos
        await db.execute(`
            CREATE TABLE IF NOT EXISTS candidatos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_completo TEXT NOT NULL,
                foto_url TEXT,
                lista TEXT NOT NULL,
                propuestas TEXT,
                orden INTEGER DEFAULT 0,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla candidatos creada');

        // Crear tabla de votos
        await db.execute(`
            CREATE TABLE IF NOT EXISTS votos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                estudiante_id INTEGER NOT NULL,
                candidato_id INTEGER NOT NULL,
                fecha_voto DATETIME DEFAULT (datetime('now', '-5 hours')),
                FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
                FOREIGN KEY (candidato_id) REFERENCES candidatos(id),
                UNIQUE(estudiante_id)
            )
        `);
        console.log('✅ Tabla votos creada');

        // Crear índices
        await db.execute('CREATE INDEX IF NOT EXISTS idx_votos_estudiante ON votos(estudiante_id)');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_votos_candidato ON votos(candidato_id)');
        console.log('✅ Índices creados');

        // Verificar si ya hay candidatos
        const result = await db.execute('SELECT COUNT(*) as count FROM candidatos');

        if (result.rows[0].count === 0) {
            // Insertar candidatos de ejemplo
            await db.execute(`
                INSERT INTO candidatos (nombre_completo, lista, propuestas, orden, foto_url) VALUES
                ('María González Pérez', 'Lista A - Cambio Estudiantil', 'Mejora de infraestructura, más actividades deportivas, biblioteca digital', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'),
                ('Carlos Rodríguez López', 'Lista B - Futuro Brillante', 'Internet gratis, más talleres artísticos, mejora del comedor', 2, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'),
                ('Ana Martínez Silva', 'Lista C - Juntos por el Cole', 'Áreas verdes, reciclaje, apoyo psicológico estudiantil', 3, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana')
            `);
            console.log('✅ Candidatos de ejemplo insertados');
        } else {
            console.log('ℹ️  Ya existen candidatos en la base de datos');
        }

        console.log('\n🎉 Base de datos configurada exitosamente');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupDatabase();
