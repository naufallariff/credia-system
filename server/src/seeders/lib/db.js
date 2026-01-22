const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Establishes connection to the MongoDB database.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[Seeder] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Seeder] Connection Error: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Truncates all collections to ensure a clean slate.
 * @param {Array<Object>} models - Array of Mongoose models to clear.
 */
const clearDatabase = async (models) => {
    console.log('[Seeder] Cleaning collections & indexes...');

    const promises = models.map(async (model) => {
        await model.deleteMany({});
        // Drop existing indexes to ensure schema changes (like sparse: true) take effect
        try {
            await model.collection.dropIndexes();
        } catch (e) {
            // Ignore error if collection/indexes don't exist yet
        }
    });

    await Promise.all(promises);
    console.log('[Seeder] Database cleared & indexes dropped.');
};
module.exports = { connectDB, clearDatabase };