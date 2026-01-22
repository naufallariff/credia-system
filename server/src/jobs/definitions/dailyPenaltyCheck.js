const Contract = require('../../models/Contract');
const { logActivity } = require('../../services/logService');
require('colors');

// Virtual System Actor for Logging
const SYSTEM_ACTOR = {
    user: { _id: null, role: 'SYSTEM', name: 'AutoScheduler' },
    ip: '127.0.0.1',
    method: 'CRON',
    originalUrl: '/jobs/daily-penalty'
};

/**
 * Job: Daily Penalty & Status Checker
 * Iterates through active contracts to identify overdue installments.
 * Updates installment status to 'LATE' and contract status to 'LATE'.
 */
const runDailyPenaltyCheck = async () => {
    console.log('[CRON] Starting Daily Penalty Check...'.blue);

    let processedCount = 0;
    let updatedCount = 0;

    try {
        // Use Cursor for memory efficiency when processing large datasets
        const cursor = Contract.find({
            status: { $in: ['ACTIVE', 'LATE'] }
        }).cursor();

        // Iterate asynchronously
        for (let contract = await cursor.next(); contract != null; contract = await cursor.next()) {
            let hasChanges = false;
            let currentContractStatus = contract.status;

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to midnight

            // Check Amortization Schedule
            contract.amortization.forEach((item) => {
                if (item.status === 'UNPAID') {
                    const dueDate = new Date(item.due_date);
                    dueDate.setHours(0, 0, 0, 0);

                    // If Due Date has passed
                    if (today > dueDate) {
                        if (item.status !== 'LATE') {
                            item.status = 'LATE';
                            hasChanges = true;

                            // If any item is late, the whole contract is late
                            if (currentContractStatus !== 'LATE') {
                                currentContractStatus = 'LATE';
                            }
                        }
                    }
                }
            });

            if (hasChanges || contract.status !== currentContractStatus) {
                contract.status = currentContractStatus;
                await contract.save();
                updatedCount++;

                // Audit Trail
                logActivity(
                    SYSTEM_ACTOR,
                    'UPDATE',
                    `System marked contract as ${currentContractStatus} due to overdue payments.`,
                    'Contract',
                    contract._id
                );
            }

            processedCount++;
        }

        console.log(`[CRON] Penalty Check Finished. Scanned: ${processedCount}, Updated: ${updatedCount}`.green);

    } catch (error) {
        console.error(`[CRON ERROR] Penalty Job Failed: ${error.message}`.red);
    }
};

module.exports = runDailyPenaltyCheck;