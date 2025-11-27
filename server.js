import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para producción
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Conexión a Turso
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// ==================== RUTAS ====================

/**
 * GET /api/health
 * Verificar que el servidor está funcionando
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

/**
 * POST /api/auth/student
 * Validar DNI del estudiante y retornar sus datos
 */
app.post('/api/auth/student', async (req, res) => {
    try {
        const { dni } = req.body;

        if (!dni) {
            return res.status(400).json({
                success: false,
                message: 'El DNI es requerido'
            });
        }

        // Validar formato de DNI (8 dígitos)
        if (!/^\d{8}$/.test(dni)) {
            return res.status(400).json({
                success: false,
                message: 'El DNI debe tener 8 dígitos'
            });
        }

        // Buscar estudiante en la base de datos
        const result = await db.execute({
            sql: `
                SELECT 
                    e.id,
                    e.numero_documento as dni,
                    e.nombres,
                    e.apellido_paterno,
                    e.apellido_materno,
                    e.sexo,
                    pm.grado,
                    pm.seccion,
                    pm.nivel,
                    ie.nombre_ie,
                    ie.codigo_modular
                FROM estudiantes e
                JOIN padron_matricula pm ON e.id = pm.estudiante_id
                JOIN instituciones_educativas ie ON pm.institucion_id = ie.id
                WHERE e.numero_documento = ?
                AND pm.anio = 2025
                LIMIT 1
            `,
            args: [dni]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'DNI no encontrado en el padrón electoral'
            });
        }

        const estudiante = result.rows[0];

        // Verificar si ya votó
        const votoResult = await db.execute({
            sql: 'SELECT id FROM votos WHERE estudiante_id = ?',
            args: [estudiante.id]
        });

        if (votoResult.rows.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'Ya has ejercido tu derecho al voto',
                yaVoto: true
            });
        }

        // Retornar datos del estudiante
        res.json({
            success: true,
            estudiante: {
                id: estudiante.id,
                dni: estudiante.dni,
                nombreCompleto: `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`,
                grado: estudiante.grado,
                seccion: estudiante.seccion,
                nivel: estudiante.nivel,
                institucion: estudiante.nombre_ie
            }
        });

    } catch (error) {
        console.error('Error en /api/auth/student:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar el estudiante',
            error: error.message
        });
    }
});

/**
 * GET /api/candidatos
 * Obtener lista de candidatos
 */
app.get('/api/candidatos', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT 
                id,
                nombre_completo,
                foto_url,
                lista,
                propuestas,
                orden
            FROM candidatos
            WHERE activo = 1
            ORDER BY orden ASC
        `);

        res.json({
            success: true,
            candidatos: result.rows
        });

    } catch (error) {
        console.error('Error en /api/candidatos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener candidatos',
            error: error.message
        });
    }
});

/**
 * POST /api/votar
 * Registrar voto del estudiante
 */
app.post('/api/votar', async (req, res) => {
    try {
        const { estudianteId, candidatoId } = req.body;

        if (!estudianteId || !candidatoId) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }

        // Verificar que el estudiante no haya votado
        const votoExistente = await db.execute({
            sql: 'SELECT id FROM votos WHERE estudiante_id = ?',
            args: [estudianteId]
        });

        if (votoExistente.rows.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'Ya has votado anteriormente'
            });
        }

        // Registrar el voto
        await db.execute({
            sql: `
                INSERT INTO votos (estudiante_id, candidato_id, fecha_voto)
                VALUES (?, ?, datetime('now', '-5 hours'))
            `,
            args: [estudianteId, candidatoId]
        });

        res.json({
            success: true,
            message: 'Voto registrado exitosamente'
        });

    } catch (error) {
        console.error('Error en /api/votar:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar el voto',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/admin
 * Autenticar administrador
 */
app.post('/api/auth/admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Por ahora, credenciales hardcodeadas (luego puedes usar una tabla)
        const ADMIN_USERNAME = 'admin';
        const ADMIN_PASSWORD = 'admin123'; // En producción, usar hash

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            res.json({
                success: true,
                admin: {
                    username,
                    role: 'admin'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

    } catch (error) {
        console.error('Error en /api/auth/admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error al autenticar',
            error: error.message
        });
    }
});

/**
 * GET /api/resultados
 * Obtener resultados de las elecciones
 */
app.get('/api/resultados', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT 
                c.id,
                c.nombre_completo,
                c.lista,
                c.foto_url,
                COUNT(v.id) as total_votos
            FROM candidatos c
            LEFT JOIN votos v ON c.id = v.candidato_id
            WHERE c.activo = 1
            GROUP BY c.id, c.nombre_completo, c.lista, c.foto_url
            ORDER BY total_votos DESC
        `);

        // Total de votos
        const totalResult = await db.execute(
            'SELECT COUNT(*) as total FROM votos'
        );

        res.json({
            success: true,
            resultados: result.rows,
            totalVotos: totalResult.rows[0].total
        });

    } catch (error) {
        console.error('Error en /api/resultados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener resultados',
            error: error.message
        });
    }
});

// ==================== RUTAS DE ADMINISTRACIÓN ====================

/**
 * GET /api/admin/stats
 * Obtener estadísticas generales
 */
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalEstudiantes = await db.execute(
            'SELECT COUNT(*) as total FROM estudiantes'
        );

        res.json({
            success: true,
            totalEstudiantes: totalEstudiantes.rows[0].total
        });
    } catch (error) {
        console.error('Error en /api/admin/stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/candidatos
 * Obtener todos los candidatos (incluye inactivos)
 */
app.get('/api/admin/candidatos', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT 
                id,
                nombre_completo,
                foto_url,
                lista,
                propuestas,
                orden,
                activo,
                created_at
            FROM candidatos
            ORDER BY orden ASC, created_at DESC
        `);

        res.json({
            success: true,
            candidatos: result.rows
        });
    } catch (error) {
        console.error('Error en /api/admin/candidatos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener candidatos',
            error: error.message
        });
    }
});

/**
 * POST /api/admin/candidatos
 * Crear un nuevo candidato
 */
app.post('/api/admin/candidatos', async (req, res) => {
    try {
        const { nombre_completo, lista, foto_url, propuestas, orden, activo } = req.body;

        if (!nombre_completo || !lista || !propuestas) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        await db.execute({
            sql: `
                INSERT INTO candidatos 
                (nombre_completo, lista, foto_url, propuestas, orden, activo)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [
                nombre_completo,
                lista,
                foto_url || null,
                propuestas,
                orden || 0,
                activo ? 1 : 0
            ]
        });

        res.json({
            success: true,
            message: 'Candidato creado exitosamente'
        });
    } catch (error) {
        console.error('Error en POST /api/admin/candidatos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear candidato',
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/candidatos/:id
 * Actualizar un candidato
 */
app.put('/api/admin/candidatos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, lista, foto_url, propuestas, orden, activo } = req.body;

        await db.execute({
            sql: `
                UPDATE candidatos
                SET nombre_completo = ?,
                    lista = ?,
                    foto_url = ?,
                    propuestas = ?,
                    orden = ?,
                    activo = ?
                WHERE id = ?
            `,
            args: [
                nombre_completo,
                lista,
                foto_url,
                propuestas,
                orden || 0,
                activo ? 1 : 0,
                id
            ]
        });

        res.json({
            success: true,
            message: 'Candidato actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error en PUT /api/admin/candidatos/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar candidato',
            error: error.message
        });
    }
});

/**
 * DELETE /api/admin/candidatos/:id
 * Eliminar un candidato
 */
app.delete('/api/admin/candidatos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si tiene votos
        const votosResult = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM votos WHERE candidato_id = ?',
            args: [id]
        });

        if (votosResult.rows[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar un candidato que ya tiene votos'
            });
        }

        await db.execute({
            sql: 'DELETE FROM candidatos WHERE id = ?',
            args: [id]
        });

        res.json({
            success: true,
            message: 'Candidato eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en DELETE /api/admin/candidatos/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar candidato',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/votantes
 * Obtener lista de estudiantes que ya votaron
 */
app.get('/api/admin/votantes', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT 
                e.id,
                e.numero_documento as dni,
                e.nombres || ' ' || e.apellido_paterno || ' ' || e.apellido_materno as nombre_completo,
                pm.grado,
                pm.seccion,
                pm.nivel,
                strftime('%Y-%m-%d %H:%M:%S', v.fecha_voto, '-5 hours') as fecha_voto,
                c.nombre_completo as candidato_nombre,
                c.lista as candidato_lista
            FROM votos v
            JOIN estudiantes e ON v.estudiante_id = e.id
            JOIN padron_matricula pm ON e.id = pm.estudiante_id
            JOIN candidatos c ON v.candidato_id = c.id
            WHERE pm.anio = 2025
            ORDER BY v.fecha_voto DESC
        `);

        res.json({
            success: true,
            votantes: result.rows
        });
    } catch (error) {
        console.error('Error en /api/admin/votantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener votantes',
            error: error.message
        });
    }
});

/**
 * POST /api/cloudinary/signature
 * Genera una firma para subir imágenes de forma segura a Cloudinary
 */
app.post('/api/cloudinary/signature', async (req, res) => {
    try {
        const timestamp = Math.round(Date.now() / 1000);
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!apiSecret) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary no está configurado en el servidor'
            });
        }

        // Parámetros para la firma
        const params = {
            timestamp: timestamp,
            folder: 'candidatos',
            upload_preset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'elecciones_preset'
        };

        // Crear la firma usando crypto
        const crypto = await import('crypto');
        const paramsString = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        const signature = crypto
            .createHash('sha1')
            .update(paramsString + apiSecret)
            .digest('hex');

        res.json({
            success: true,
            signature: signature,
            timestamp: timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error('Error generando firma Cloudinary:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar firma',
            error: error.message
        });
    }
});

// ==================== SERVIDOR ====================

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Base de datos conectada a Turso`);
});
