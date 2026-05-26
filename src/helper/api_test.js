/**
 * Admin Login API Test Suite
 * Use this file to test the admin login API integration
 */

// Test Configuration
const API_BASE_URL = 'http://localhost:8088/api';

// Test Credentials (Update with your admin credentials)
const TEST_CREDENTIALS = {
    email: 'admin@example.com',
    password: 'admin123'
};

/**
 * Test 1: Login with Valid Credentials
 */
async function testValidLogin() {
    console.log('🧪 Test 1: Login with Valid Credentials');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_CREDENTIALS)
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Test 1 PASSED');
            console.log('Token:', data.token);
            console.log('User:', data.user);
            return data.token;
        } else {
            console.log('❌ Test 1 FAILED');
            console.log('Error:', data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Test 1 FAILED with exception');
        console.error('Error:', error.message);
        return null;
    }
}

/**
 * Test 2: Login with Invalid Credentials
 */
async function testInvalidLogin() {
    console.log('\n🧪 Test 2: Login with Invalid Credentials');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'wrong@example.com',
                password: 'wrongpassword'
            })
        });

        const data = await response.json();

        if (!data.success) {
            console.log('✅ Test 2 PASSED - Correctly rejected invalid credentials');
            console.log('Error Message:', data.message);
        } else {
            console.log('❌ Test 2 FAILED - Should have rejected invalid credentials');
        }
    } catch (error) {
        console.log('❌ Test 2 FAILED with exception');
        console.error('Error:', error.message);
    }
}

/**
 * Test 3: Login with Missing Fields
 */
async function testMissingFields() {
    console.log('\n🧪 Test 3: Login with Missing Fields');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com'
                // password missing
            })
        });

        const data = await response.json();

        if (!data.success) {
            console.log('✅ Test 3 PASSED - Correctly rejected missing fields');
            console.log('Error Message:', data.message);
        } else {
            console.log('❌ Test 3 FAILED - Should have rejected missing fields');
        }
    } catch (error) {
        console.log('❌ Test 3 FAILED with exception');
        console.error('Error:', error.message);
    }
}

/**
 * Test 4: Protected Route with Valid Token
 */
async function testProtectedRoute(token) {
    console.log('\n🧪 Test 4: Protected Route with Valid Token');

    if (!token) {
        console.log('⚠️ Skipping Test 4 - No token available');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/category`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.statusCode === 200 || response.ok) {
            console.log('✅ Test 4 PASSED - Protected route accessible with valid token');
            console.log('Data received:', data);
        } else {
            console.log('❌ Test 4 FAILED - Protected route not accessible');
            console.log('Response:', data);
        }
    } catch (error) {
        console.log('❌ Test 4 FAILED with exception');
        console.error('Error:', error.message);
    }
}

/**
 * Test 5: Protected Route without Token
 */
async function testProtectedRouteNoToken() {
    console.log('\n🧪 Test 5: Protected Route without Token');

    try {
        const response = await fetch(`${API_BASE_URL}/category`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.status === 401 || !data.success) {
            console.log('✅ Test 5 PASSED - Protected route correctly rejected request without token');
            console.log('Error Message:', data.message);
        } else {
            console.log('❌ Test 5 FAILED - Protected route should require token');
        }
    } catch (error) {
        console.log('❌ Test 5 FAILED with exception');
        console.error('Error:', error.message);
    }
}

/**
 * Test 6: Token Format Validation
 */
async function testTokenFormat(token) {
    console.log('\n🧪 Test 6: Token Format Validation');

    if (!token) {
        console.log('⚠️ Skipping Test 6 - No token available');
        return;
    }

    // Check if token is JWT format (three parts separated by dots)
    const parts = token.split('.');

    if (parts.length === 3) {
        console.log('✅ Test 6 PASSED - Token is in valid JWT format');
        console.log('Token parts:', {
            header: parts[0].substring(0, 20) + '...',
            payload: parts[1].substring(0, 20) + '...',
            signature: parts[2].substring(0, 20) + '...'
        });
    } else {
        console.log('❌ Test 6 FAILED - Token is not in valid JWT format');
        console.log('Token:', token);
    }
}

/**
 * Run All Tests
 */
async function runAllTests() {
    console.log('🚀 Starting Admin Login API Tests');
    console.log('API Base URL:', API_BASE_URL);
    console.log('='.repeat(60));

    // Test 1: Valid Login
    const token = await testValidLogin();

    // Test 2: Invalid Login
    await testInvalidLogin();

    // Test 3: Missing Fields
    await testMissingFields();

    // Test 4: Protected Route with Token
    await testProtectedRoute(token);

    // Test 5: Protected Route without Token
    await testProtectedRouteNoToken();

    // Test 6: Token Format
    await testTokenFormat(token);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('Check results above for any failures.');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testValidLogin,
        testInvalidLogin,
        testMissingFields,
        testProtectedRoute,
        testProtectedRouteNoToken,
        testTokenFormat,
        runAllTests
    };
}

// Auto-run if executed directly in browser console
if (typeof window !== 'undefined') {
    console.log('💡 Admin Login API Test Suite Loaded');
    console.log('Run tests with: runAllTests()');
    console.log('Or run individual tests like: testValidLogin()');
}
