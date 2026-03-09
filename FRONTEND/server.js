import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080; // Changed from 8000 to avoid conflict with FastAPI

// Improved CORS: Only allow Vite dev server in development
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Basic Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Ensure the directory exists
const uploadDir = path.join(__dirname, 'voice');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `recording-${uniqueSuffix}.wav`);
    }
});

// Added file size limit (10MB) for security
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/process-voice', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No audio file uploaded.');
    }

    console.log(`Saved recording: ${req.file.filename}`);

    res.json({
        user_transcript: "Voice recording saved.",
        ai_response: `I've received your voice command and saved it as ${req.file.filename} in the assets folder.`,
        filename: req.file.filename
    });
});

app.listen(port, () => {
    console.log(`Recording server listening at http://localhost:${port}`);
    console.log(`Files will be saved to: ${uploadDir}`);
});
