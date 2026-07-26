document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('qr-form');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultSection = document.getElementById('result-section');
    const qrImage = document.getElementById('qr-image');
    const downloadBtn = document.getElementById('download-btn');

    // Backend API URL (Vercel Serverless Function)
    const API_URL = '/api/generate-qr';
        
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Extract data
        const formData = new FormData(form);
        const payload = {
            rawString: formData.get('rawString')
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
                const filename = `eway_qr_code.jpg`;
                qrImage.setAttribute('data-filename', filename);
            }

        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}. Could not connect to the backend server at 139.59.60.77.`);
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
