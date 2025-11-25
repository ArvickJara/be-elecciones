// api/admin/candidatos.js
import { getDb } from '../_db.js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getDb();

    try {
        // GET - Obtener todos los candidatos (incluye inactivos)
        if (req.method === 'GET') {
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

            return res.json({
                success: true,
                candidatos: result.rows
            });
        }

        // POST - Crear un nuevo candidato
        if (req.method === 'POST') {
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

            return res.json({
                success: true,
                message: 'Candidato creado exitosamente'
            });
        }

        // PUT - Actualizar un candidato
        if (req.method === 'PUT') {
            const { id, nombre_completo, lista, foto_url, propuestas, orden, activo } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del candidato es requerido'
                });
            }

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

            return res.json({
                success: true,
                message: 'Candidato actualizado exitosamente'
            });
        }

        // DELETE - Eliminar un candidato
        if (req.method === 'DELETE') {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del candidato es requerido'
                });
            }

            await db.execute({
                sql: 'DELETE FROM candidatos WHERE id = ?',
                args: [id]
            });

            return res.json({
                success: true,
                message: 'Candidato eliminado exitosamente'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Error en /api/admin/candidatos:', error);
        res.status(500).json({
            success: false,
            message: 'Error en la operación',
            error: error.message
        });
    }
}
