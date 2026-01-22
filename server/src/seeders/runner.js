const { connectDB, clearDatabase } = require('./lib/db');

// Import Models for cleaning
const User = require('../models/User');
const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const GlobalConfig = require('../models/GlobalConfig');
const ModificationTicket = require('../models/ModificationTicket');
const Notification = require('../models/Notification');

// Import Suites
const seedConfigs = require('./suites/01_config.seeder');
const seedUsers = require('./suites/02_user.seeder');
const seedContracts = require('./suites/03_contract.seeder');
const seedTransactions = require('./suites/04_transaction.seeder');
const seedNotifications = require('./suites/05_notification.seeder');

const runSeed = async () => {
    try {
        await connectDB();

        // 1. Clear Data
        await clearDatabase([
            User, 
            Contract, 
            Transaction, 
            GlobalConfig, 
            ModificationTicket, 
            Notification
        ]);

        // 2. CRITICAL: Drop indexes to ensure schema changes (like sparse: true) take effect immediately.
        // This prevents E11000 duplicate key errors on nullable unique fields from previous schema versions.
        try {
            await Contract.collection.dropIndexes();
            // Re-sync indexes based on the current Mongoose Schema definition
            await Contract.syncIndexes();
            console.log('[Seeder] Indexes rebuilt successfully.');
        } catch (idxError) {
            // Ignore error if collection does not exist yet (first run)
            if (idxError.code !== 26) {
                console.warn('[Seeder] Warning during index rebuild:', idxError.message);
            }
        }

        // 3. Execute Suites
        await seedConfigs();
        const usersMap = await seedUsers();
        const contracts = await seedContracts(usersMap);
        await seedTransactions(contracts, usersMap.admins[0]);
        await seedNotifications(usersMap, contracts);

        console.log('[Seeder] All suites executed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('[Seeder] Execution Failed:', error);
        process.exit(1);
    }
};

runSeed();