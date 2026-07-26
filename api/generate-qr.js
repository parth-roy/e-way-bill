const QRCode = require('qrcode');



module.exports = async (req, res) => {
    // Standard Vercel Serverless CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { rawString } = req.body;

        if (!rawString) {
            return res.status(400).json({ error: 'Missing raw E-Way Bill string' });
        }

        const qrConfig = {
            errorCorrectionLevel: 'M',
            type: 'image/jpeg',
            margin: 4,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        };

        const qrImageBase64 = await QRCode.toDataURL(rawString, qrConfig);

        res.status(200).json({
            success: true,
            qrImage: qrImageBase64
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
};
