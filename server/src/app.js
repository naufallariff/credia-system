const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('colors'); // Load colors extensions
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Utility & Middleware Imports
const { successResponse, errorResponse } = require('./utils/response');
const errorHandler = require('./middlewares/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const contractRoutes = require('./routes/contractRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const configRoutes = require('./routes/configRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// --- 1. SECURITY & UTILITY MIDDLEWARE ---

// Set Security HTTP Headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Body Parser with strict limit to prevent DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Data Sanitization against NoSQL Query Injection
// app.use(
//     mongoSanitize({
//         onSanitize: ({ req, key }) => {
//             console.warn(`[SECURITY] This request[${key}] is sanitized`, req[key]);
//         },
//     })
// );

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Development Logging
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

// --- 2. ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config', configRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
    return successResponse(res, 'Credia Enterprise Server V3.0 is operational');
});

// --- 3. ERROR HANDLING ---

// 404 Not Found Handler (Fallback Middleware)
// FIX: Using app.use() instead of app.all('*') to prevent Regex errors in newer Express versions
app.use((req, res, next) => {
    return errorResponse(res, `Route ${req.originalUrl} not found on this server`, 404);
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;