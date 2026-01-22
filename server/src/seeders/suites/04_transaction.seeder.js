const { faker } = require('@faker-js/faker');
const Transaction = require('../../models/Transaction');

const seedTransactions = async (contracts, adminUser) => {
    console.log('[04] Seeding Transactions...');
    const transactions = [];

    // Filter only Active contracts that have paid amortizations
    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');

    for (const contract of activeContracts) {
        // Find paid installments in amortization array
        const paidInstallments = contract.amortization.filter(a => a.status === 'PAID');

        for (const installment of paidInstallments) {
            transactions.push({
                contract: contract._id,
                transaction_no: `TXN-${faker.string.alphanumeric(12).toUpperCase()}`,
                amount_paid: installment.amount,
                period_month: installment.month,
                penalty_included: 0,
                payment_method: faker.helpers.arrayElement(['TRANSFER', 'VA']),
                status: 'SUCCESS',
                processed_by: adminUser._id,
                processed_at: installment.paid_at
            });
        }
    }

    await Transaction.insertMany(transactions);
};

module.exports = seedTransactions;