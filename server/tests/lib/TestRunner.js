const colors = require('colors');

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
    }

    // Header for a Group of Tests
    group(title) {
        console.log(`\n========================================`.gray);
        console.log(`SUITE: ${title}`.bold.cyan);
        console.log(`========================================`.gray);
    }

    // Individual Test Execution
    async test(description, fn) {
        process.stdout.write(`TEST: ${description} ... `.white);
        try {
            await fn();
            console.log(`[PASS]`.green.bold);
            this.passed++;
        } catch (error) {
            console.log(`[FAIL]`.red.bold);
            console.log(`    REASON: ${error.message}`.red);
            if (error.response) {
                console.log(`    API RESPONSE: ${JSON.stringify(error.response.data)}`.gray);
            }
            this.failed++;
        }
    }

    // Assertion Logic (Validation)
    assertEquals(actual, expected, context) {
        if (actual !== expected) {
            throw new Error(`${context} -> Expected '${expected}', but got '${actual}'`);
        }
    }

    assertTruthy(value, context) {
        if (!value) {
            throw new Error(`${context} -> Expected truthy value, got ${value}`);
        }
    }

    assertStatus(response, status) {
        if (response.status !== status) {
            throw new Error(`HTTP Status -> Expected ${status}, got ${response.status}`);
        }
    }

    summary() {
        console.log(`\n----------------------------------------`.gray);
        console.log(`TEST SUMMARY`.bold);
        console.log(`TOTAL:  ${this.passed + this.failed}`);
        console.log(`PASSED: ${this.passed}`.green);
        console.log(`FAILED: ${this.failed}`.red);
        console.log(`----------------------------------------`.gray);
        if (this.failed > 0) process.exit(1);
    }
}

module.exports = new TestRunner();