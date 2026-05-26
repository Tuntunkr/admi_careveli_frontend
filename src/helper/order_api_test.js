/**
 * Order API Test Suite
 * Use this file to test the Order API integration in browser console
 * 
 * USAGE:
 * 1. Make sure you're logged in as admin
 * 2. Open browser console (F12)
 * 3. Run: window.testOrderAPI()
 */

import {
    getAllOrders,
    updateOrderStatus,
    getOrderById,
    formatCurrency,
    getStatusBadgeColor,
    getPaymentStatusBadgeColor
} from './order_helper';

/**
 * Test all Order API endpoints
 */
export const testOrderAPI = async () => {
    console.log('=== Starting Order API Tests ===\n');

    // Get admin token
    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('❌ No admin token found. Please login first.');
        return;
    }

    console.log('✅ Admin token found\n');

    // Test 1: Get All Orders
    console.log('Test 1: Get All Orders');
    try {
        const result = await getAllOrders(token, { page: 1, limit: 10 });
        console.log('✅ Success:', result);
        console.log(`Found ${result.orders?.length || 0} orders\n`);
    } catch (error) {
        console.error('❌ Error:', error, '\n');
    }

    // Test 2: Get Orders with Filters
    console.log('Test 2: Get Orders with Status Filter');
    try {
        const result = await getAllOrders(token, {
            page: 1,
            limit: 10,
            status: 'Pending'
        });
        console.log('✅ Success:', result);
        console.log(`Found ${result.orders?.length || 0} pending orders\n`);
    } catch (error) {
        console.error('❌ Error:', error, '\n');
    }

    // Test 3: Search Orders
    console.log('Test 3: Search Orders');
    try {
        const result = await getAllOrders(token, {
            page: 1,
            limit: 10,
            search: 'john'
        });
        console.log('✅ Success:', result);
        console.log(`Found ${result.orders?.length || 0} orders matching "john"\n`);
    } catch (error) {
        console.error('❌ Error:', error, '\n');
    }

    console.log('=== Order API Tests Complete ===');
};

/**
 * Test getting a specific order by ID
 */
export const testGetOrder = async (orderId) => {
    console.log(`=== Testing Get Order: ${orderId} ===\n`);

    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('❌ No admin token found. Please login first.');
        return;
    }

    try {
        const result = await getOrderById(orderId, token);
        console.log('✅ Success:', result);

        if (result.success && result.data?.order) {
            const order = result.data.order;
            console.log('\n📦 Order Details:');
            console.log('Order Number:', order.orderNumber);
            console.log('Status:', order.status);
            console.log('Total:', formatCurrency(order.total));
            console.log('Items:', order.items?.length || 0);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

/**
 * Test updating order status
 */
export const testUpdateStatus = async (orderId, newStatus) => {
    console.log(`=== Testing Update Status ===`);
    console.log(`Order ID: ${orderId}`);
    console.log(`New Status: ${newStatus}\n`);

    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('❌ No admin token found. Please login first.');
        return;
    }

    try {
        const result = await updateOrderStatus(orderId, newStatus, token);
        console.log('✅ Success:', result);

        if (result.success) {
            console.log('✅ Order status updated successfully!');
        } else {
            console.error('❌ Failed to update status:', result.message);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

/**
 * Test with different filters
 */
export const testOrderFilters = async () => {
    console.log('=== Testing Order Filters ===\n');

    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('❌ No admin token found. Please login first.');
        return;
    }

    // Test different filter combinations
    const testCases = [
        { name: 'All Orders', params: { page: 1, limit: 10 } },
        { name: 'Pending Orders', params: { status: 'Pending' } },
        { name: 'COD Orders', params: { paymentMethod: 'COD' } },
        { name: 'Completed Payments', params: { paymentStatus: 'Completed' } },
        { name: 'High Value Orders', params: { sortBy: 'total', order: 'desc', limit: 5 } },
        { name: 'Recent Orders', params: { sortBy: 'date', order: 'desc', limit: 5 } }
    ];

    for (const testCase of testCases) {
        console.log(`\nTest: ${testCase.name}`);
        try {
            const result = await getAllOrders(token, testCase.params);
            if (result.success) {
                console.log(`✅ Found ${result.orders?.length || 0} orders`);
            } else {
                console.error(`❌ Failed:`, result.message);
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }

    console.log('\n=== Filter Tests Complete ===');
};

/**
 * Quick test - just check if API is working
 */
export const quickOrderTest = async () => {
    console.log('=== Quick Order API Test ===\n');

    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.warn('⚠️ No admin token found. Please login first.');
        return;
    }

    console.log('1. Testing order list endpoint...');
    try {
        const result = await getAllOrders(token, { page: 1, limit: 5 });
        if (result.success) {
            console.log(`✅ API working - Found ${result.orders?.length || 0} orders`);

            if (result.orders && result.orders.length > 0) {
                const firstOrder = result.orders[0];
                console.log('\n📦 Sample Order:');
                console.log('Order #:', firstOrder.orderNumber);
                console.log('Status:', firstOrder.status);
                console.log('Total:', formatCurrency(firstOrder.total || firstOrder.amount));
                console.log('Payment:', firstOrder.paymentMethod);
            }
        } else {
            console.error('❌ API failed:', result.message);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }

    console.log('\n=== Quick Test Complete ===');
};

/**
 * Display order statistics
 */
export const testOrderStats = async () => {
    console.log('=== Order Statistics ===\n');

    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('❌ No admin token found. Please login first.');
        return;
    }

    try {
        const result = await getAllOrders(token, { page: 1, limit: 100 });

        if (result.success && result.orders) {
            const orders = result.orders;

            // Calculate statistics
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.amount || 0), 0);
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Count by status
            const statusCount = {};
            orders.forEach(order => {
                statusCount[order.status] = (statusCount[order.status] || 0) + 1;
            });

            // Count by payment method
            const paymentMethodCount = {};
            orders.forEach(order => {
                paymentMethodCount[order.paymentMethod] = (paymentMethodCount[order.paymentMethod] || 0) + 1;
            });

            console.log('📊 Statistics:');
            console.log('Total Orders:', totalOrders);
            console.log('Total Revenue:', formatCurrency(totalRevenue));
            console.log('Average Order Value:', formatCurrency(avgOrderValue));

            console.log('\n📈 By Status:');
            Object.entries(statusCount).forEach(([status, count]) => {
                console.log(`${status}: ${count}`);
            });

            console.log('\n💳 By Payment Method:');
            Object.entries(paymentMethodCount).forEach(([method, count]) => {
                console.log(`${method}: ${count}`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
    window.testOrderAPI = testOrderAPI;
    window.testGetOrder = testGetOrder;
    window.testUpdateStatus = testUpdateStatus;
    window.testOrderFilters = testOrderFilters;
    window.quickOrderTest = quickOrderTest;
    window.testOrderStats = testOrderStats;

    console.log('🎯 Order API Test Functions Available:');
    console.log('- window.testOrderAPI() - Test all endpoints');
    console.log('- window.testGetOrder(orderId) - Get specific order');
    console.log('- window.testUpdateStatus(orderId, status) - Update order status');
    console.log('- window.testOrderFilters() - Test different filters');
    console.log('- window.quickOrderTest() - Quick API check');
    console.log('- window.testOrderStats() - Display statistics');
}

export default {
    testOrderAPI,
    testGetOrder,
    testUpdateStatus,
    testOrderFilters,
    quickOrderTest,
    testOrderStats
};
