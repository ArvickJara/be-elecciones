// api/candidatos.js
import { getDb } from './_db.js';

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
}
