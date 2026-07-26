const QRCode = require('qrcode');

const pad = (num) => num.toString().padStart(2, '0');
const formatDate = (date) => {
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

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
        const { consignee, commodity, quantity, value, marketFee, vehicleNo } = req.body;

        if (!consignee || !commodity || !quantity || !value || !marketFee || !vehicleNo) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const now = new Date();
        const validDateObj = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        
        const printDate = formatDate(now);
        const validDate = formatDate(validDateObj);

        // String formatting precisely as required
        const rawString = `PRN,PG-1AS2F8|PC,84L|LN,|CSE,${consignee.toUpperCase()} |COM,${commodity.toUpperCase()}\`QTWT,${Number(quantity).toFixed(1)}\`VAL,${value}\`MKTFE,${Number(marketFee).toFixed(2)}\`|VN,${vehicleNo.toUpperCase()}|TN,|TCN,|VD,${validDate}|PD,${printDate}|PT,SPOT|`;

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
