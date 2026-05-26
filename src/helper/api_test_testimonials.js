/**
 * Test file to check testimonials API endpoints
 * Run this in browser console to test API connectivity
 */

const API_URL = "https://careevali-backend.vercel.app/api/";

// Test 1: Get active testimonials (public endpoint - no auth required)
export async function testActiveTestimonials() {
    console.log('=== Testing Active Testimonials (Public) ===');
    const url = `${API_URL}v1/testimonials/active`;
    console.log('URL:', url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('Response Data:', data);
        console.log('Data Type:', typeof data);
        console.log('Data Keys:', data ? Object.keys(data) : 'null');

        return data;
    } catch (error) {
        console.error('Error:', error);
        return { error: error.message };
    }
}

// Test 2: Get all testimonials (admin endpoint - requires auth)
export async function testAllTestimonials(token) {
    console.log('=== Testing All Testimonials (Admin) ===');
    const url = `${API_URL}v1/testimonials/all?isDeleted=false`;
    console.log('URL:', url);
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
        const storedToken = localStorage.getItem('adminToken');
        console.log('Using stored token:', storedToken ? 'Present' : 'Missing');
        token = storedToken;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('Response Data:', data);
        console.log('Data Type:', typeof data);
        console.log('Data Keys:', data ? Object.keys(data) : 'null');

        return data;
    } catch (error) {
        console.error('Error:', error);
        return { error: error.message };
    }
}

// Test 3: Check CORS
export async function testCORS() {
    console.log('=== Testing CORS ===');
    const url = `${API_URL}v1/testimonials/active`;

    try {
        const response = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            }
        });

        console.log('CORS Check Status:', response.status);
        console.log('Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
        console.log('Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
        console.log('Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));

        return {
            status: response.status,
            allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
            allowMethods: response.headers.get('Access-Control-Allow-Methods'),
            allowHeaders: response.headers.get('Access-Control-Allow-Headers')
        };
    } catch (error) {
        console.error('CORS Error:', error);
        return { error: error.message };
    }
}

// Run all tests
export async function runAllTests(token) {
    console.log('🧪 Starting API Tests...\n');

    await testActiveTestimonials();
    console.log('\n');

    await testAllTestimonials(token);
    console.log('\n');

    await testCORS();
    console.log('\n');

    console.log('✅ All tests completed!');
}

// Auto-run tests if this file is imported
// Uncomment the line below to auto-run tests
// runAllTests();

// To use in browser console:
// import('./helper/api_test_testimonials.js').then(m => m.runAllTests())
