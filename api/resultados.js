// api/resultados.js
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
}
