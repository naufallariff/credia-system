const Contract = require('../../models/Contract');
const { sendNotification } = require('../../services/notificationService');
const { sendWelcomeEmail } = require('../../services/emailService'); // Assuming generic email sender exists, or create sendReminderEmail
require('colors');

/**
 * Job: Payment Reminder Sender
 * Finds installments due in exactly 3 days and sends notifications.
 */
const runPaymentReminder = async () => {
    console.log('[CRON] Starting Payment Reminder Job...'.blue);

    try {
        const today = new Date();
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + 3); // H-3 Target
        targetDate.setHours(0, 0, 0, 0);

        // Find contracts with installments due on targetDate
        // Optimization: Use aggregation to filter exact subdocuments
        const contractsDue = await Contract.find({
            status: { $in: ['ACTIVE', 'LATE'] },
            'amortization': {
                $elemMatch: {
                    status: { $in: ['UNPAID'] },
                    due_date: {
                        $gte: targetDate,
                        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) // End of target day
                    }
                }
            }
        }).populate('client', 'email name _id');

        let emailCount = 0;

        for (const contract of contractsDue) {
            if (!contract.client) continue;

            const dueItem = contract.amortization.find(item => {
                const d = new Date(item.due_date);
                return d.getDate() === targetDate.getDate() &&
                    d.getMonth() === targetDate.getMonth() &&
                    d.getFullYear() === targetDate.getFullYear();
            });

            if (dueItem) {
                // 1. Send In-App Notification
                await sendNotification(
                    contract.client._id,
                    'INFO',
                    'Payment Reminder',
                    `Your installment of Rp ${dueItem.amount.toLocaleString()} is due on ${new Date(dueItem.due_date).toLocaleDateString()}.`,
                    contract._id
                );

                // 2. Send Email (Mocking generic email function for now)
                // In production, create a specific template 'sendPaymentReminderEmail' in emailService
                console.log(`[MOCK EMAIL] Sending reminder to ${contract.client.email} for Contract ${contract.contract_no}`.gray);

                emailCount++;
            }
        }

        console.log(`[CRON] Reminders Sent: ${emailCount}`.green);

    } catch (error) {
        console.error(`[CRON ERROR] Reminder Job Failed: ${error.message}`.red);
    }
};

module.exports = runPaymentReminder;