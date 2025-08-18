import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport.js';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config({ path: './config.env' });
connectDB();

const app = express();
// Behind Vite dev proxy and for reverse proxies in general
app.set('trust proxy', 1);
// CORS: allow configured origin and common localhost variants
const allowedOrigins = new Set([
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps, curl, same-origin
    if (allowedOrigins.has(origin)) return callback(null, true);
    // Also allow any localhost dev ports
    if (/^http:\/\/localhost:\d+$/i.test(origin)) return callback(null, true);
    return callback(null, true); // be permissive in dev
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set true only when serving over HTTPS
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static uploads (e.g., images referenced as /uploads/filename.jpg)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/images', imageRoutes);

app.get('/', (req, res) => {
  res.send('Herbal Garden API is running');
});

// Error handlers (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Create temp directory if it doesn't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// GridFS removed - using static file serving for 3D models

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
