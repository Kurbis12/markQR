fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);
                if (code) {
                    // Hide all elements except the result
                    videoContainer.style.display = 'none';
                    scannerBox.style.display = 'none';
                    canvas.style.display = 'none';
                    debugCanvas.style.display = 'none';
                    startBtn.style.display = 'none';
                    stopBtn.style.display = 'none';
                    fileInput.style.display = 'none';
                    backBtn.style.display = 'block';

                    // Show the result
                    output.style.display = 'block';
                    output.textContent = `QR code Data: ${code.data}`;

                    // Stop camera stream if it was active
                    stopCameraStream();

                    // Save QR code data to localStorage
                    localStorage.setItem('scannedCode', code.data);

                    // Redirect to result.html
                    window.location.href = '/html/result.html';
                } else {
                    output.textContent = 'QR code was not found';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
