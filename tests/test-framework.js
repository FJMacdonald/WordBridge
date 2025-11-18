/**
 * Simple Test Framework for WordBridge
 */
const TestFramework = {
    results: [],
    currentSuite: '',
    
    /**
     * Define a test suite
     */
    describe(name, fn) {
        this.currentSuite = name;
        console.log(`\n📦 ${name}`);
        fn();
    },
    
    /**
     * Define a test
     */
    it(description, fn) {
        const testName = `${this.currentSuite} > ${description}`;
        try {
            fn();
            this.results.push({ name: testName, passed: true });
            console.log(`  ✅ ${description}`);
        } catch (error) {
            this.results.push({ name: testName, passed: false, error });
            console.error(`  ❌ ${description}`);
            console.error(`     ${error.message}`);
        }
    },
    
    /**
     * Assertions
     */
    expect(actual) {
        return {
            toBe(expected) {
                if (actual !== expected) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
                }
            },
            
            toEqual(expected) {
                const actualStr = JSON.stringify(actual);
                const expectedStr = JSON.stringify(expected);
                if (actualStr !== expectedStr) {
                    throw new Error(`Expected ${expectedStr}, got ${actualStr}`);
                }
            },
            
            toBeTruthy() {
                if (!actual) {
                    throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
                }
            },
            
            toBeFalsy() {
                if (actual) {
                    throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
                }
            },
            
            toBeGreaterThan(expected) {
                if (!(actual > expected)) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            
            toBeLessThan(expected) {
                if (!(actual < expected)) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            },
            
            toContain(item) {
                if (Array.isArray(actual)) {
                    if (!actual.includes(item)) {
                        throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
                    }
                } else if (typeof actual === 'string') {
                    if (!actual.includes(item)) {
                        throw new Error(`Expected string to contain "${item}"`);
                    }
                }
            },
            
            toHaveLength(length) {
                if (actual.length !== length) {
                    throw new Error(`Expected length ${length}, got ${actual.length}`);
                }
            },
            
            toThrow() {
                if (typeof actual !== 'function') {
                    throw new Error('Expected a function');
                }
                let threw = false;
                try {
                    actual();
                } catch {
                    threw = true;
                }
                if (!threw) {
                    throw new Error('Expected function to throw');
                }
            },
            
            toBeDefined() {
                if (actual === undefined) {
                    throw new Error('Expected value to be defined');
                }
            },
            
            toBeNull() {
                if (actual !== null) {
                    throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
                }
            }
        };
    },
    
    /**
     * Run before each test (setup)
     */
    beforeEach(fn) {
        this._beforeEach = fn;
    },
    
    /**
     * Run after each test (cleanup)
     */
    afterEach(fn) {
        this._afterEach = fn;
    },
    
    /**
     * Get test summary
     */
    getSummary() {
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        const total = this.results.length;
        
        return { passed, failed, total };
    },
    
    /**
     * Print summary
     */
    printSummary() {
        const { passed, failed, total } = this.getSummary();
        
        console.log('\n' + '='.repeat(50));
        console.log(`Tests: ${passed} passed, ${failed} failed, ${total} total`);
        
        if (failed === 0) {
            console.log('✅ All tests passed!');
        } else {
            console.log('❌ Some tests failed');
            this.results
                .filter(r => !r.passed)
                .forEach(r => console.log(`  - ${r.name}: ${r.error.message}`));
        }
    },
    
    /**
     * Reset for new test run
     */
    reset() {
        this.results = [];
        this.currentSuite = '';
    }
};

// Shortcuts
const describe = TestFramework.describe.bind(TestFramework);
const it = TestFramework.it.bind(TestFramework);
const expect = TestFramework.expect.bind(TestFramework);
const beforeEach = TestFramework.beforeEach.bind(TestFramework);
const afterEach = TestFramework.afterEach.bind(TestFramework);