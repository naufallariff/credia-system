const colors = require('colors');

class TestRunner {
    constructor() {
        this.groupName = '';
        this.total = 0;
        this.passed = 0;
        this.failed = 0;
        this.context = {}; // Shared memory between suites
    }

    /**
     * Start a new Test Suite Group
     */
    group(name) {
        this.groupName = name;
        console.log(`\n${'='.repeat(80)}`.gray);
        console.log(`SUITE: ${name}`.cyan.bold);
        console.log(`${'='.repeat(80)}\n`.gray);
    }

    /**
     * Document the business rule being tested
     */
    doc(objective, expected) {
        console.log(`  ${'[OBJ]'.blue} ${objective}`);
        console.log(`  ${'[EXP]'.blue} ${expected}`);
    }

    /**
     * Execute a specific test case
     */
    async test(description, fn) {
        this.total++;
        process.stdout.write(`  TEST: ${description} ... `);

        const start = Date.now();
        try {
            await fn();
            const duration = Date.now() - start;
            console.log(`PASSED (${duration}ms)`.green.bold);
            this.passed++;
        } catch (error) {
            console.log(`FAILED`.red.bold);
            console.log(`\n    ${'!!! ERROR DETAIL !!!'.red.bold}`);
            console.log(`    Message: ${error.message}`.yellow);

            if (error.response) {
                console.log(`    Status:  ${error.response.status}`);
                console.log(`    Data:    ${JSON.stringify(error.response.data)}`.gray);
            }
            console.log('');
            this.failed++;
            // In strict enterprise testing, one fail might mean stop immediately
            // But we continue to see full report
        }
    }

    /**
     * Set a global context variable (e.g., Tokens, IDs)
     */
    setContext(key, value) {
        this.context[key] = value;
    }

    /**
     * Get a global context variable
     */
    getContext(key) {
        return this.context[key];
    }

    // --- Assertions ---

    assertStatus(response, expectedStatus) {
        if (response.status !== expectedStatus) {
            throw new Error(`HTTP Status mismatch. Expected ${expectedStatus}, got ${response.status}`);
        }
    }

    assertEquals(actual, expected, fieldName) {
        if (actual !== expected) {
            throw new Error(`${fieldName} mismatch. Expected '${expected}', got '${actual}'`);
        }
    }

    assertTruthy(value, fieldName) {
        if (!value) {
            throw new Error(`${fieldName} expected to be truthy/present.`);
        }
    }

    summary() {
        console.log(`\n${'='.repeat(80)}`.gray);
        console.log('FINAL QUALITY ASSURANCE REPORT'.white.bold);
        console.log(`${'='.repeat(80)}`.gray);
        console.log(`Total Test Cases : ${this.total}`);
        console.log(`Success Rate     : ${Math.round((this.passed / this.total) * 100)}%`);
        console.log(`Passed           : ${this.passed}`.green);
        console.log(`Failed           : ${this.failed}`.red);

        if (this.failed > 0) process.exit(1);
        process.exit(0);
    }
}

module.exports = new TestRunner();