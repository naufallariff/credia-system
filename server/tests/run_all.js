const colors = require('colors');
const runner = require('./lib/TestRunner');

// Suites
const authSuite = require('./suites/01_auth.spec.js');
const contractSuite = require('./suites/02_contract.spec.js');
const paymentSuite = require('./suites/03_payment.spec.js');

const main = async () => {
    console.clear();
    console.log('CREDIA SYSTEM V3.0 - ENTERPRISE AUTOMATED TESTING'.blue.bold);
    console.log(`Environment: Localhost:5000`.gray);
    console.log('Target: Full Integration (Auth -> Workflow -> Finance)\n'.gray);

    try {
        await authSuite();
        await contractSuite();
        await paymentSuite();
    } catch (err) {
        console.error('\nCRITICAL TEST SUITE ERROR:'.red.bold);
        console.error(err);
    } finally {
        runner.summary();
    }
};

main();