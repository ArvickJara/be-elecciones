// api/admin/stats.js
import { getDb } from '../_db.js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getDb();

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
}
