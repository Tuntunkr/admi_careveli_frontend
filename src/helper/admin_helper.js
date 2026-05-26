import { get } from './api_helper';

/**
 * Get admin dashboard statistics
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response with admin stats
 */
export const getAdminStats = (token) => {
    return get('user/admin/stats', { token });
};

/**
 * Get user analytics
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const getUserAnalytics = (token) => {
    return get('user/admin/analytics', { token });
};

/**
 * Get order analytics
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const getOrderAnalytics = (token) => {
    return get('user/admin/orders/analytics', { token });
};

/**
 * Get revenue analytics
 * @param {string} token - Admin authentication token
 * @param {Object} params - Query parameters (startDate, endDate, etc.)
 * @returns {Promise} API response
 */
export const getRevenueAnalytics = (token, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `user/admin/revenue/analytics${queryParams ? `?${queryParams}` : ''}`;
    return get(url, { token });
};

/**
 * Get all registered users (Admin only)
 * @param {string} token - Admin authentication token
 * @param {Object} params - Query parameters (page, limit, search, role, etc.)
 * @returns {Promise} API response with users list and pagination
 */
export const getAllUsers = (token, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `user/all${queryParams ? `?${queryParams}` : ''}`;
    console.log('getAllUsers - URL:', url);
    console.log('getAllUsers - Query Params:', queryParams);
    return get(url, { token });
};
