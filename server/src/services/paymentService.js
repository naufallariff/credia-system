const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const { generateId } = require('../utils/idGenerator');

const processPayment = async (contractId, month, amountInput, staffId) => {
    const contract = await Contract.findById(contractId);
    if (!contract) throw { statusCode: 404, message: 'Contract not found' };

    const scheduleItem = contract.amortization.find(a => a.month === parseInt(month));
    if (!scheduleItem) throw { statusCode: 404, message: 'Installment month not found' };

    if (scheduleItem.status === 'PAID') {
        throw { statusCode: 400, message: 'Installment already paid' };
    }

    // 1. Calculate Expected Amount (Principal + Penalty)
    const dueDate = new Date(scheduleItem.due_date);
    const today = new Date();
    let penalty = 0;

    // Strict Date Comparison (Ignore Time)
    if (today.setHours(0,0,0,0) > dueDate.setHours(0,0,0,0)) {
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // 0.5% per day penalty rule
        penalty = Math.ceil(scheduleItem.amount * 0.005 * diffDays);
    }

    const totalExpected = scheduleItem.amount + penalty;

    // 2. Strict Amount Validation
    // In Enterprise systems, we generally do not accept partial payments for installments
    // to avoid complex accounting states.
    if (amountInput < totalExpected) {
        throw { 
            statusCode: 400, 
            message: `Insufficient amount. Expected Rp ${totalExpected} (Inc. Penalty), Received Rp ${amountInput}` 
        };
    }

    // 3. Execute Transaction
    const txn = await Transaction.create({
        contract: contract._id,
        transaction_no: generateId('TRANSACTION'),
        amount_paid: amountInput,
        period_month: month,
        penalty_included: penalty,
        status: 'SUCCESS',
        processed_by: staffId
    });

    // 4. Update Contract State
    scheduleItem.status = 'PAID';
    scheduleItem.paid_at = new Date();
    scheduleItem.penalty_paid = penalty;
    
    contract.total_paid += amountInput;
    contract.remaining_loan -= scheduleItem.amount; // Reduce principal only
    
    // Check if fully closed
    if (contract.remaining_loan <= 0) {
        contract.status = 'CLOSED';
    }

    await contract.save();

    return txn;
};

module.exports = { processPayment };