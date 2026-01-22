const Notification = require('../../models/Notification');

/**
 * Seeder for Notifications.
 * Ensures that specific users receive appropriate alerts based on their roles and contract status.
 */
const seedNotifications = async (usersMap, contracts) => {
    console.log('[05] Seeding Notifications (RBAC Aware)...');
    const notifs = [];
    const { admins, staff } = usersMap;

    // Target specific active users
    const adminUser = admins.find(u => u.email === 'sarah.jenkins@credia.finance');
    const staffUser = staff.find(u => u.email === 'emily.blunt@credia.finance');

    // --- 1. ADMIN NOTIFICATIONS (New Approvals) ---
    // All PENDING_ACTIVATION contracts trigger an alert for Admins
    const pendingContracts = contracts.filter(c => c.status === 'PENDING_ACTIVATION');

    pendingContracts.forEach(contract => {
        admins.forEach(admin => {
            // Only alert active admins
            if (admin.status === 'ACTIVE') {
                notifs.push({
                    recipient_id: admin._id,
                    type: 'INFO',
                    title: 'Approval Required',
                    message: `New application submitted by ${contract.client_name_snapshot} (ID: ${contract.submission_id}). Requires review.`,
                    is_read: false,
                    action_link: `/approvals`
                });
            }
        });
    });

    // --- 2. STAFF NOTIFICATIONS (Feedback Loop) ---
    // Staff needs to know if their applications were REJECTED
    const rejectedContracts = contracts.filter(c => c.status === 'REJECTED');
    rejectedContracts.forEach(contract => {
        notifs.push({
            recipient_id: staffUser._id,
            type: 'ERROR',
            title: 'Application Rejected',
            message: `Contract ${contract.contract_no} for ${contract.client_name_snapshot} was rejected. Reason: ${contract.void_reason}`,
            is_read: false,
            action_link: `/contracts/${contract._id}`
        });
    });

    // --- 3. CLIENT NOTIFICATIONS (Customer Journey) ---

    // A. Payment Overdue (For Hugh Grant - The Late Payer)
    const macetContract = contracts.find(c => c.status === 'ACTIVE' && c.remaining_loan > 0 && c.amortization.some(a => a.status === 'LATE'));
    if (macetContract) {
        notifs.push({
            recipient_id: macetContract.client,
            type: 'WARNING',
            title: 'Action Required: Payment Overdue',
            message: 'You have outstanding installments marked as LATE. Immediate payment is required to avoid penalties.',
            is_read: false,
            action_link: `/client/dashboard`
        });
    }

    // B. Loan Completion (For William Thacker - The Good Payer)
    const lunasContract = contracts.find(c => c.status === 'CLOSED');
    if (lunasContract) {
        notifs.push({
            recipient_id: lunasContract.client,
            type: 'SUCCESS',
            title: 'Loan Fully Paid',
            message: 'Congratulations! Your financing contract has been successfully completed. Thank you for choosing Credia Finance.',
            is_read: true, // Historical notification
            action_link: `/client/dashboard`
        });
    }

    // C. Application Received (For Emma Watson - New Applicant)
    const baruContract = contracts.find(c => c.status === 'PENDING_ACTIVATION' && !c.contract_no);
    if (baruContract) {
        notifs.push({
            recipient_id: baruContract.client,
            type: 'INFO',
            title: 'Application Received',
            message: 'We have received your financing application. Our team is currently reviewing your documents.',
            is_read: false,
            action_link: `/client/dashboard`
        });
    }

    await Notification.insertMany(notifs);
};

module.exports = seedNotifications;