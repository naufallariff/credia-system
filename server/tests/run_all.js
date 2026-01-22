const colors = require('colors');
const runner = require('./lib/TestRunner');

// Import All Suites
const authSuite = require('./suites/01_auth.spec.js');
const configSuite = require('./suites/02_config.spec.js');
const contractSuite = require('./suites/03_contract.spec.js');
const workflowSuite = require('./suites/04_workflow.spec.js');
const paymentSuite = require('./suites/05_payment.spec.js');
const auditSuite = require('./suites/06_audit_dashboard.spec.js');
const notificationSuite = require('./suites/07_notification.spec.js'); // [NEW]

const main = async () => {
    console.clear();
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════╗'.blue.bold);
    console.log('║      CREDIA SYSTEM V3.0 - ENTERPRISE INTEGRATION TESTS       ║'.blue.bold);
    console.log('╚══════════════════════════════════════════════════════════════╝'.blue.bold);
    console.log(`Target      : Full System Regression`.gray);
    console.log(`Standard    : ISO/IEC 25010 (Functional Suitability)`.gray);

    try {
        // Step 1: Security & Config
        await authSuite();
        await configSuite();

        // Step 2: Core Business Logic
        await contractSuite();
        await workflowSuite();
        await paymentSuite();

        // Step 3: Supporting Systems
        await notificationSuite(); // [NEW] Inserted here (Logical flow)
        await auditSuite();        // Audit checks everything above

    } catch (err) {
        console.error('\nCRITICAL EXECUTION ERROR:'.red.bold);
        console.error(err);
        process.exit(1);
    } finally {
        runner.summary();
    }
};

main();