const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const colors = require('colors');
const { sendResponse } = require('./utils/response');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const contractRoutes = require('./routes/contractRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();

// Middleware Security & Utility
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logger
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

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config', configRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Credia Enterprise Server V3.0' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log critical errors
    if (statusCode >= 500) {
        console.error(`[CRITICAL] ${err.stack}`.red);
    }

    sendResponse(res, statusCode, false, message);
});

// EXPORT THE APP, DO NOT LISTEN HERE
module.exports = app;