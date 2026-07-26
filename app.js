document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('qr-form');
    const valueInput = document.getElementById('value');
    const marketFeeInput = document.getElementById('marketFee');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultSection = document.getElementById('result-section');
    const qrImage = document.getElementById('qr-image');
    const downloadBtn = document.getElementById('download-btn');

    // Automatically calculate market fee (1% of value)
    valueInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            marketFeeInput.value = (val * 0.01).toFixed(2);
        } else {
            marketFeeInput.value = '';
        }
    });

    // Environment API URL configuration
    // Fallback to local dev server if not in production
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api/generate-qr'
        : 'https://transport-qr-backend.onrender.com/api/generate-qr'; 
        // NOTE: Please update the render URL domain once deployed.
        
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Extract data
        const formData = new FormData(form);
        const payload = {
            consignee: formData.get('consignee'),
            commodity: formData.get('commodity'),
            quantity: formData.get('quantity'),
            value: formData.get('value'),
            marketFee: formData.get('marketFee'),
            vehicleNo: formData.get('vehicleNo')
        };

        // UI Loading State
        btnText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        generateBtn.disabled = true;
        resultSection.classList.add('hidden');

        try {
            // API Call
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to generate QR');
            }

            const data = await response.json();

            // Handle Success
            if (data.success && data.qrImage) {
                qrImage.src = data.qrImage;
                resultSection.classList.remove('hidden');
                
                // Store base64 for download
                qrImage.setAttribute('data-download', data.qrImage);
                // Also store a nice filename
                const filename = `eway_qr_${payload.vehicleNo.replace(/\s+/g, '')}.jpg`;
                qrImage.setAttribute('data-filename', filename);
            }

        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}. If the backend is on a free Render tier, it might be sleeping. Please try again in a few seconds.`);
        } finally {
            // Reset UI State
            btnText.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    // Download Handler
    downloadBtn.addEventListener('click', () => {
        const base64Data = qrImage.getAttribute('data-download');
        const filename = qrImage.getAttribute('data-filename') || 'eway_qr_code.jpg';
        
        if (!base64Data) return;

        const a = document.createElement('a');
        a.href = base64Data;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
