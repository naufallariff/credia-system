const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Validation
if (!MONGO_URI) {
    console.error('[CRITICAL] MONGO_URI is not defined in .env file'.red.bold);
    process.exit(1);
}

// Database Connection & Server Startup
const startServer = async () => {
    try {
        // 1. Connect to Database
        const conn = await mongoose.connect(MONGO_URI);

        console.log(`[INIT] Database Connected: ${conn.connection.host}`.cyan.underline);

        // 2. Start Listening
        const server = app.listen(PORT, () => {
            console.log(`[INFO] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold);
        });

        // 3. Graceful Shutdown Handling
        const shutdown = () => {
            console.log('\n[INFO] Termination signal received. Closing server...'.magenta);
            server.close(async () => {
                console.log('[INFO] Server closed.'.gray);
                await mongoose.connection.close(false);
                console.log('[INFO] MongoDB connection closed.'.gray);
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        console.error(`[ERROR] Server Startup Failed: ${error.message}`.red.bold);
        process.exit(1);
    }
};

startServer();