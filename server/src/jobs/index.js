const cron = require('node-cron');
const runDailyPenaltyCheck = require('./definitions/dailyPenaltyCheck');
const runPaymentReminder = require('./definitions/paymentReminder');
require('colors');

/**
 * Initialize System Schedulers
 * Configures all background jobs with specific timezones.
 */
const initScheduler = () => {
    console.log('[INIT] Scheduler System Initialized'.cyan);

    const TIMEZONE = "Asia/Jakarta";

    // 1. Daily Penalty Check
    // Schedule: Every day at 00:01 WIB
    cron.schedule('1 0 * * *', () => {
        runDailyPenaltyCheck();
    }, {
        scheduled: true,
        timezone: TIMEZONE
    });

    // 2. Payment Reminder (H-3)
    // Schedule: Every day at 09:00 WIB (Morning)
    cron.schedule('0 9 * * *', () => {
        runPaymentReminder();
    }, {
        scheduled: true,
        timezone: TIMEZONE
    });
};

module.exports = initScheduler;