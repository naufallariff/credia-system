const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { errorResponse, successResponse } = require('./utils/response');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const contractRoutes = require('./routes/contractRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();

// --- 1. SECURITY & UTILITY MIDDLEWARE ---
app.use(helmet()); // Secure HTTP Headers
app.use(cors()); // Allow Cross-Origin
app.use(express.json({ limit: '10kb' })); // Body limit prevents DoS
app.use(express.urlencoded({ extended: true }));

// Data Sanitization
app.use(mongoSanitize()); // Prevent NoSQL Injection (remove $ signs)
app.use(xss()); // Prevent XSS Attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Logger (Development Only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan((tokens, req, res) => {
        const status = tokens.status(req, res);
        const color = status >= 500 ? 'red' : status >= 400 ? 'yellow' : 'green';
        return [
            '[API]'.blue,
            tokens.method(req, res),
            tokens.url(req, res),
            status[color],
            tokens['response-time'](req, res), 'ms'
        ].join(' ');
    }));
}

// --- 2. ROUTES REGISTRATION ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config', configRoutes);

// Health Check
app.get('/', (req, res) => {
    return successResponse(res, 'Credia Enterprise Server V3.0 is running');
});

// Handle 404 (Not Found)
app.all('*', (req, res, next) => {
    return errorResponse(res, `Route ${req.originalUrl} not found on this server`, 404);
});

// --- 3. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    // Determine status code (support custom throws like { statusCode: 400 })
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log critical server errors
    if (statusCode >= 500) {
        console.error(`[CRITICAL] ${err.stack}`.red);
    }

    return errorResponse(res, message, statusCode);
});

module.exports = app;