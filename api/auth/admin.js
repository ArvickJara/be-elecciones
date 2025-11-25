// api/auth/admin.js
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
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Obtener credenciales desde variables de entorno
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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
}
