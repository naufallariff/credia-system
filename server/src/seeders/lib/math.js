/**
 * Generates a flat-rate amortization schedule.
 * * @param {number} principal - Loan principal amount.
 * @param {number} interestRateYear - Yearly interest rate in percent.
 * @param {number} durationMonth - Loan duration in months.
 * @param {Date} startDate - The start date of the loan.
 * @returns {Object} { schedule, monthlyInstallment, totalInterest }
 */
const generateAmortization = (principal, interestRateYear, durationMonth, startDate) => {
    const schedule = [];

    // Flat rate calculation standard
    const totalInterest = principal * (interestRateYear / 100) * (durationMonth / 12);
    const totalLoan = principal + totalInterest;
    const monthlyInstallment = Math.ceil(totalLoan / durationMonth);

    let currentDate = new Date(startDate);

    for (let i = 1; i <= durationMonth; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        schedule.push({
            month: i,
            due_date: new Date(currentDate),
            amount: monthlyInstallment,
            status: 'UNPAID',
            penalty_paid: 0,
            paid_at: null
        });
    }

    return { schedule, monthlyInstallment, totalInterest };
};

module.exports = { generateAmortization };