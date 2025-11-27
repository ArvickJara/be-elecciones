// api/votar.js
import { getDb } from './_db.js';
import { notifyVotoRegistrado } from '../lib/realtime.js';

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
        const { estudianteId, candidatoId } = req.body;

        if (!estudianteId || !candidatoId) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }

        const db = getDb();

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

        await notifyVotoRegistrado({
            estudianteId,
            candidatoId,
            timestamp: new Date().toISOString()
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
}
