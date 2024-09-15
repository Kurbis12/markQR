import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import fs from 'fs/promises';
import jsQR from 'jsqr'; // Use import instead of require

const hostname = 'localhost';
const PORT = 1200;

// To set up __dirname in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static('public'));
// Starting page or login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});




// Example usage of jsQR
// This assumes you're getting the image data from somewhere, you might want to adjust this
// jsQR(imageData, width, height); // Example usage

// Runs up on correct IP address and port. Prints in console log that it is running and on what address
app.listen(PORT, hostname, () => {
    console.log(`Server is running on http://${hostname}:${PORT}`);
});
