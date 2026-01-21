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
    console.log('[Seeder] Cleaning collections...');
    const promises = models.map(model => model.deleteMany({}));
    await Promise.all(promises);
    console.log('[Seeder] Database cleared.');
};

module.exports = { connectDB, clearDatabase };