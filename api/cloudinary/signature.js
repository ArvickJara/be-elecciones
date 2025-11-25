// api/cloudinary/signature.js
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
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'elecciones_preset'
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
}
