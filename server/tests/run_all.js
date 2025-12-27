const runner = require('./lib/TestRunner');

// Import Suites
const runAuth = require('./suites/01_auth.spec');
const runContract = require('./suites/02_contract.spec');
const runPayment = require('./suites/03_payment.spec');

const main = async () => {
    console.log(`\nCREDIA SYSTEM - AUTOMATED TESTING SUITE`.bold.white.bgBlue);
    console.log(`Environment: Localhost:5000`.gray);
    console.log(`Target: API Stability & Business Logic`.gray);

    try {
        // Run Sequentially
        await runAuth();
        await runContract();
        await runPayment();

        // Print Final Result
        runner.summary();
        
    } catch (error) {
        console.error('FATAL ERROR IN TEST SUITE:'.red, error);
    }
};

main();