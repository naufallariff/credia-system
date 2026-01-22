const mongoose = require('mongoose');
const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const { generateId } = require('../utils/idGenerator');

/**
 * Processes installment payment.
 * Handles penalty calculation, transaction recording, and contract balance updates.
 * Uses ACID transactions to prevent partial updates.
 */
const processPayment = async (contractId, month, amountInput, staffId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const contract = await Contract.findById(contractId).session(session);
        if (!contract) throw { statusCode: 404, message: 'Contract not found' };

        // Find specific month schedule
        // Note: Mongoose subdocument arrays usually don't support .find() directly on lean queries inside transaction context easily, 
        // so we iterate manually or use filter.
        const scheduleItem = contract.amortization.find(a => a.month === parseInt(month));

        if (!scheduleItem) throw { statusCode: 404, message: 'Installment month not found in schedule' };
        if (scheduleItem.status === 'PAID') throw { statusCode: 400, message: 'Installment already paid' };

        // 1. Calculate Financials
        const dueDate = new Date(scheduleItem.due_date);
        const today = new Date();
        let penalty = 0;

        // Strict Date Comparison (Midnight UTC)
        if (today.setHours(0, 0, 0, 0) > dueDate.setHours(0, 0, 0, 0)) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // 0.5% Penalty Rule
            penalty = Math.ceil(scheduleItem.amount * 0.005 * diffDays);
        }

        const totalExpected = scheduleItem.amount + penalty;

        // 2. Amount Validation
        // Enterprise Rule: Reject underpayment to maintain clean ledger
        if (amountInput < totalExpected) {
            throw {
                statusCode: 400,
                message: `Insufficient payment. Bill: ${totalExpected} (Principal: ${scheduleItem.amount} + Penalty: ${penalty}). Received: ${amountInput}`
            };
        }

        // 3. Create Transaction Record
        const txn = await Transaction.create([{
            contract: contract._id,
            transaction_no: generateId('TRANSACTION'),
            amount_paid: amountInput,
            period_month: month,
            penalty_included: penalty,
            status: 'SUCCESS',
            processed_by: staffId
        }], { session });

        // 4. Update Contract State
        // Since we are modifying a subdocument in an array, Mongoose handles this well on .save()
        scheduleItem.status = 'PAID';
        scheduleItem.paid_at = new Date();
        scheduleItem.penalty_paid = penalty;

        contract.total_paid += amountInput;
        contract.remaining_loan -= scheduleItem.amount; // Reduce principal debt only

        // Auto-close contract if zero balance
        if (contract.remaining_loan <= 0) {
            contract.status = 'CLOSED';
        }

        await contract.save({ session });
        await session.commitTransaction();
        session.endSession();

        return txn[0]; // Return the created transaction object

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

module.exports = { processPayment };