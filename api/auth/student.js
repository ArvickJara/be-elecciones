// api/auth/student.js
import { getDb } from '../_db.js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        const db = getDb();

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
}
