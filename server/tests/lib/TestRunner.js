const colors = require('colors');

class TestRunner {
    constructor() {
        this.groupName = '';
        this.total = 0;
        this.passed = 0;
        this.failed = 0;
    }

    group(name) {
        this.groupName = name;
        console.log(`\n[SUITE] ${name}`.cyan.bold);
        console.log('='.repeat(50).gray);
    }

    async test(description, fn) {
        this.total++;
        process.stdout.write(`TEST: ${description} ... `);
        
        try {
            await fn();
            console.log('[PASS]'.green.bold);
            this.passed++;
        } catch (error) {
            console.log('[FAIL]'.red.bold);
            console.log(`    REASON: ${error.message}`.yellow);
            if (error.response && error.response.data) {
                console.log(`    API RESPONSE: ${JSON.stringify(error.response.data)}`.gray);
            }
            this.failed++;
        }
    }

    assertStatus(response, expectedStatus) {
        if (response.status !== expectedStatus) {
            throw new Error(`HTTP Status -> Expected ${expectedStatus}, got ${response.status}`);
        }
    }

    assertEquals(actual, expected, fieldName) {
        if (actual !== expected) {
            throw new Error(`${fieldName} -> Expected '${expected}', but got '${actual}'`);
        }
    }

    assertTruthy(value, fieldName) {
        if (!value) {
            throw new Error(`${fieldName} -> Expected truthy value, got ${value}`);
        }
    }

    summary() {
        console.log('\n' + '-'.repeat(50).gray);
        console.log('TEST SUMMARY'.white.bold);
        console.log(`TOTAL:  ${this.total}`);
        console.log(`PASSED: ${this.passed}`.green);
        console.log(`FAILED: ${this.failed}`.red);
        console.log('-'.repeat(50).gray + '\n');
        
        if (this.failed > 0) process.exit(1);
        process.exit(0);
    }
}

module.exports = new TestRunner();