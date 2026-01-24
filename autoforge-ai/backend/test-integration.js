const axios = require('axios');

/**
 * Test Backend Integration
 * Verifies all backend endpoints and ML Engine connectivity
 */

const BACKEND_URL = 'http://localhost:5000';
const ML_ENGINE_URL = 'http://localhost:5001';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, method = 'GET', data = null) {
    try {
        const config = { method, url, timeout: 10000 };
        if (data) config.data = data;

        const response = await axios(config);
        log(`✓ ${name}`, 'green');
        return { success: true, data: response.data };
    } catch (error) {
        log(`✗ ${name}: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function runTests() {
    log('\n========================================', 'blue');
    log('  AutoForge AI Integration Tests', 'blue');
    log('========================================\n', 'blue');

    let passed = 0;
    let failed = 0;

    // Test 1: Backend Health
    log('\n[1/5] Testing Backend Health...', 'yellow');
    const backendHealth = await testEndpoint(
        'Backend Health Check',
        `${BACKEND_URL}/api/health`
    );
    if (backendHealth.success) {
        passed++;
        log(`  Status: ${backendHealth.data.status}`, 'green');
        log(`  Service: ${backendHealth.data.service}`, 'green');
        if (backendHealth.data.mlEngine) {
            log(`  ML Engine: ${backendHealth.data.mlEngine.status}`,
                backendHealth.data.mlEngine.status === 'connected' ? 'green' : 'yellow');
        }
    } else {
        failed++;
    }

    // Test 2: ML Engine Health
    log('\n[2/5] Testing ML Engine Health...', 'yellow');
    const mlHealth = await testEndpoint(
        'ML Engine Health Check',
        `${ML_ENGINE_URL}/api/ml/health`
    );
    if (mlHealth.success) {
        passed++;
        log(`  Status: ${mlHealth.data.status}`, 'green');
        log(`  Service: ${mlHealth.data.service}`, 'green');
    } else {
        failed++;
    }

    // Test 3: List Available Models
    log('\n[3/5] Testing ML Models Endpoint...', 'yellow');
    const models = await testEndpoint(
        'List Available Models',
        `${ML_ENGINE_URL}/api/ml/models`
    );
    if (models.success) {
        passed++;
        log(`  Models Available: ${models.data.models?.length || 0}`, 'green');
    } else {
        failed++;
    }

    // Test 4: Backend Root Endpoint
    log('\n[4/5] Testing Backend Root...', 'yellow');
    const root = await testEndpoint(
        'Backend Root Endpoint',
        `${BACKEND_URL}/`
    );
    if (root.success) {
        passed++;
        log(`  Service: ${root.data.service}`, 'green');
    } else {
        failed++;
    }

    // Test 5: CORS Configuration
    log('\n[5/5] Testing CORS Configuration...', 'yellow');
    try {
        const response = await axios.options(`${BACKEND_URL}/api/health`);
        log('✓ CORS Configuration', 'green');
        passed++;
    } catch (error) {
        log(`✗ CORS Configuration: ${error.message}`, 'red');
        failed++;
    }

    // Summary
    log('\n========================================', 'blue');
    log('  Test Summary', 'blue');
    log('========================================', 'blue');
    log(`  Passed: ${passed}`, 'green');
    log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`  Total:  ${passed + failed}\n`, 'blue');

    if (failed === 0) {
        log('✓ All tests passed! Backend is ready.', 'green');
        process.exit(0);
    } else {
        log('✗ Some tests failed. Please check the services.', 'red');
        log('\nTroubleshooting:', 'yellow');
        log('  1. Ensure backend is running: cd backend && npm start', 'yellow');
        log('  2. Ensure ML Engine is running: cd ml-engine && python app.py', 'yellow');
        log('  3. Check ports 5000 and 5001 are not in use by other apps\n', 'yellow');
        process.exit(1);
    }
}

// Run tests
log('\nStarting integration tests...\n', 'blue');
log('Prerequisites:', 'yellow');
log('  • Backend should be running on port 5000', 'yellow');
log('  • ML Engine should be running on port 5001\n', 'yellow');

setTimeout(() => {
    runTests().catch(error => {
        log(`\nFatal error: ${error.message}`, 'red');
        process.exit(1);
    });
}, 1000);
