const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { errorResponse } = require('./utils/response');

const authRoutes = require('./routes/authRoutes');
const contractRoutes = require('./routes/contractRoutes');
const userRoutes = require('./routes/userRoutes'); // New: User Management

dotenv.config();
connectDB();

const app = express();

// --- 1. SECURITY MIDDLEWARES (LAYER PERTAHANAN) ---

// Helmet: Set security headers
app.use(helmet());

// Rate Limiting: Batasi 100 request per 10 menit per IP
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// CORS
app.use(cors());

// Body Parser
app.use(express.json({ limit: '10kb' })); // Batasi body max 10kb untuk cegah DOS

// --- 2. ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/users', userRoutes); // New for Admin

// --- 3. GLOBAL ERROR HANDLER ---
// Menangkap semua error yang tidak ter-handle di controller
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    // Jika Zod Error / Mongoose Error, format di sini
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return errorResponse(res, message, statusCode);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});