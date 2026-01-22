const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');
const initScheduler = require('./jobs'); // [NEW] Import Scheduler

// 1. Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...'.red.bold);
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config();
const app = require('./app');

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Validation
if (!MONGO_URI) {
    console.error('[CRITICAL] MONGO_URI is not defined in .env file'.red.bold);
    process.exit(1);
}

// 2. Database Connection & Server Startup
const startServer = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`[INIT] Database Connected: ${conn.connection.host}`.cyan.underline);

        // [NEW] Initialize Background Jobs
        // Must be called after DB connection is established
        initScheduler();

        const server = app.listen(PORT, () => {
            console.log(`[INFO] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold);
        });

        // 3. Handle Unhandled Promise Rejections
        process.on('unhandledRejection', (err) => {
            console.log('UNHANDLED REJECTION! Shutting down...'.red.bold);
            console.log(err.name, err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        // 4. Graceful Shutdown
        const gracefulShutdown = () => {
            console.log('\n[INFO] Termination signal received. Closing server...'.magenta);
            server.close(async () => {
                console.log('[INFO] HTTP server closed.'.gray);
                await mongoose.connection.close(false);
                console.log('[INFO] MongoDB connection closed.'.gray);
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error(`[ERROR] Server Startup Failed: ${error.message}`.red.bold);
        process.exit(1);
    }
};

startServer();