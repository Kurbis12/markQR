// Select the necessary HTML elements
const videoElement = document.getElementById('video');
const canvas = document.getElementById('canvas');
const debugCanvas = document.getElementById('debug-canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
const debugContext = debugCanvas.getContext('2d');
const output = document.getElementById('output');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoContainer = document.getElementById('video-container');
const scannerBox = document.getElementById('scanner-box');
const fileInput = document.getElementById('file-input');
const backBtn = document.getElementById('backBtn');
// const flashlightBtn = document.getElementById('flashlightBtn');

// Control whether scanning should continue
let scanning = false;
let videoTrack;  // Store the video track for controlling the flashlight
// let isFlashlightOn = false;  // To track the state of the flashlight
videoContainer.style.display = 'none';  // Initially hide the video container
backBtn.style.display = 'none';
// Function to start scanning and control the flashlight
function startScanning() {
    if (scanning) return;  // Prevent starting multiple scans
    scanning = true;

    // Show the video container
    videoContainer.style.display = 'block';

    // Access the device's camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.setAttribute('playsinline', true);  // For iOS devices
            videoElement.play();

            // Save the video track for flashlight control
            videoTrack = stream.getVideoTracks()[0];

            // When the video is playing, show the scanner box and start scanning for QR codes
            videoElement.addEventListener('playing', () => {
                scannerBox.style.display = 'block';
                updateCanvasSizes();
                requestAnimationFrame(scanQRCode);
            });
        })
        .catch(err => {
            console.error('Error accessing the camera', err);
            output.textContent = 'Error accessing the camera. Please check camera permissions';
            stopScanning();
        });
}

// Function to toggle the flashlight on and off
function toggleFlashlight() {
    if (!videoTrack) return;

    const capabilities = videoTrack.getCapabilities();

    // Check if torch (flashlight) is supported
    if (capabilities.torch) {
        isFlashlightOn = !isFlashlightOn;  // Toggle flashlight state
        videoTrack.applyConstraints({
            advanced: [{ torch: isFlashlightOn }]
        }).catch(err => {
            console.error('Error toggling flashlight', err);
            output.textContent = 'Flashlight is not supported on this device.';
        });
    } else {
        console.error('Torch is not supported on this device');
        output.textContent = 'Flashlight is not supported on this device.';
    }
}

// Function to stop scanning and the camera stream
function stopScanning() {
    if (!scanning) return;  // Prevent stopping if not scanning
    scanning = false;

    // Hide the video container and scanner box
    videoContainer.style.display = 'none';
    scannerBox.style.display = 'none';

    // Stop the camera stream and turn off the flashlight
    stopCameraStream();
    
}

// Function to update canvas sizes based on the video dimensions
function updateCanvasSizes() {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    debugCanvas.width = videoElement.videoWidth;
    debugCanvas.height = videoElement.videoHeight;
}

// Function to scan for QR codes
function scanQRCode() {
    if (!scanning) return;

    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        // Draw video frame onto canvas
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        debugContext.drawImage(videoElement, 0, 0, debugCanvas.width, debugCanvas.height);

        // Extract image data from the canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Define scanning area
        const boxRect = scannerBox.getBoundingClientRect();
        const videoRect = videoElement.getBoundingClientRect();
        const boxX = Math.floor((boxRect.left - videoRect.left) / videoRect.width * canvas.width);
        const boxY = Math.floor((boxRect.top - videoRect.top) / videoRect.height * canvas.height);
        const boxWidth = Math.floor(boxRect.width / videoRect.width * canvas.width);
        const boxHeight = Math.floor(boxRect.height / videoRect.height * canvas.height);

        // Extract the portion of the image data within the scanning area
        const imageDataBox = context.getImageData(boxX, boxY, boxWidth, boxHeight);

        // Use jsQR to scan for QR codes in the defined area
        const code = jsQR(imageDataBox.data, boxWidth, boxHeight);

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
            window.location.href = '/html/regMenu.html'; // Adjust path if needed
        } else {
            // Continue scanning
            requestAnimationFrame(scanQRCode);
        }
    } else {
        // Continue scanning if video is not ready
        requestAnimationFrame(scanQRCode);
    }
}


// Function to stop scanning and the camera stream
function stopScanning() {
    if (!scanning) return;  // Prevent stopping if not scanning
    scanning = false;

    // Hide the video container and scanner box
    videoContainer.style.display = 'none';
    scannerBox.style.display = 'none';

    // Stop the camera stream and turn off the flashlight
    stopCameraStream();
}

// Function to stop the camera stream
function stopCameraStream() {
    const stream = videoElement.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());  // Stop each track
        videoElement.srcObject = null;  // Clear the video element's source
        videoTrack = null;  // Clear stored video track
    }
}

// Event listeners
startBtn.addEventListener('click', startScanning);
stopBtn.addEventListener('click', stopScanning);

