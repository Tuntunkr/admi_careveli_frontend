import { get, post } from './api_helper';

/**
 * Get all orders (Admin only)
 * @param {string} token - Admin authentication token
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Promise} API response with orders list
 */
export const getAllOrders = (token, params = {}) => {
    console.log('getAllOrders - Params:', params);
    console.log('getAllOrders - Token:', token ? 'Present' : 'Missing');
    // Send params in body with token
    return post('order/list', { ...params, token });
};

/**
 * Update order status (Admin only)
 * @param {string} orderId - Order ID to update
 * @param {string} status - New status
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const updateOrderStatus = (orderId, status, token) => {
    console.log('updateOrderStatus - OrderID:', orderId, 'Status:', status);
    return post('order/status', { orderId, status, token });
};

/**
 * Get single order by ID
 * @param {string} orderId - Order ID
 * @param {string} token - Authentication token
 * @returns {Promise} API response with order details
 */
export const getOrderById = (orderId, token) => {
    console.log('getOrderById - OrderID:', orderId);
    return get(`order/${orderId}`, { token });
};

/**
 * Get user orders
 * @param {string} userId - User ID
 * @param {string} token - User authentication token
 * @returns {Promise} API response with user orders
 */
export const getUserOrders = (userId, token) => {
    console.log('getUserOrders - UserID:', userId);
    return post('order/userorders', { userId, token });
};

/**
 * Place COD order
 * @param {Object} orderData - Order details
 * @param {string} token - User authentication token
 * @returns {Promise} API response
 */
export const placeCODOrder = (orderData, token) => {
    console.log('placeCODOrder - Order Data:', orderData);
    return post('order/place', { ...orderData, token });
};

/**
 * Place Razorpay order
 * @param {Object} orderData - Order details
 * @param {string} token - User authentication token
 * @returns {Promise} API response with Razorpay details
 */
export const placeRazorpayOrder = (orderData, token) => {
    console.log('placeRazorpayOrder - Order Data:', orderData);
    return post('order/razorpay', { ...orderData, token });
};

/**
 * Verify Razorpay payment
 * @param {Object} paymentData - Payment verification data
 * @param {string} token - User authentication token
 * @returns {Promise} API response
 */
export const verifyRazorpayPayment = (paymentData, token) => {
    console.log('verifyRazorpayPayment - Payment Data:', paymentData);
    return post('order/verifyRazorpay', { ...paymentData, token });
};

/**
 * Place Stripe order
 * @param {Object} orderData - Order details
 * @param {string} token - User authentication token
 * @returns {Promise} API response with Stripe session URL
 */
export const placeStripeOrder = (orderData, token) => {
    console.log('placeStripeOrder - Order Data:', orderData);
    return post('order/stripe', { ...orderData, token });
};

/**
 * Verify Stripe payment
 * @param {Object} paymentData - Payment verification data
 * @param {string} token - User authentication token
 * @returns {Promise} API response
 */
export const verifyStripePayment = (paymentData, token) => {
    console.log('verifyStripePayment - Payment Data:', paymentData);
    return post('order/verifyStripe', { ...paymentData, token });
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount || 0);
};

/**
 * Get status badge color
 * @param {string} status - Order status
 * @returns {string} Bootstrap badge color class
 */
export const getStatusBadgeColor = (status) => {
    const statusColors = {
        'Pending': 'warning',
        'Processing': 'info',
        'Shipped': 'primary',
        'Out for Delivery': 'info',
        'Delivered': 'success',
        'Cancelled': 'danger',
        'Refunded': 'secondary',
        'Failed': 'danger'
    };
    return statusColors[status] || 'secondary';
};

/**
 * Get payment status badge color
 * @param {string} status - Payment status
 * @returns {string} Bootstrap badge color class
 */
export const getPaymentStatusBadgeColor = (status) => {
    const statusColors = {
        'Pending': 'warning',
        'Completed': 'success',
        'Failed': 'danger',
        'Refunded': 'secondary'
    };
    return statusColors[status] || 'secondary';
};

/**
 * Get available order statuses
 * @returns {Array} Array of order statuses
 */
export const getOrderStatuses = () => {
    return [
        'Pending',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Refunded',
        'Failed'
    ];
};

/**
 * Get payment methods
 * @returns {Array} Array of payment methods
 */
export const getPaymentMethods = () => {
    return ['COD', 'Razorpay', 'Stripe'];
};

/**
 * Get payment statuses
 * @returns {Array} Array of payment statuses
 */
export const getPaymentStatuses = () => {
    return ['Pending', 'Completed', 'Failed', 'Refunded'];
};
