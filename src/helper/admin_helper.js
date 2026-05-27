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
    if (!token) {
        return Promise.resolve({
            success: false,
            message: 'Not Authorized - No Token Provided',
        });
    }
    return get('user/all', { ...params, token });
};

/**
 * Normalize GET /user/all response into { users, pagination, totalUsers }.
 */
export const parseAllUsersResponse = (res) => {
    if (!res) {
        return { users: [], pagination: null, totalUsers: 0, error: 'Empty response' };
    }

    if (res.success === false) {
        return { users: [], pagination: null, totalUsers: 0, error: res.message };
    }

    let users = [];
    if (Array.isArray(res?.data?.users)) {
        users = res.data.users;
    } else if (Array.isArray(res?.users)) {
        users = res.users;
    } else if (Array.isArray(res?.data)) {
        users = res.data;
    } else if (Array.isArray(res)) {
        users = res;
    }

    const pagination = res?.data?.pagination || res?.pagination || null;
    const totalUsers =
        pagination?.totalUsers ??
        res?.data?.totalUsers ??
        res?.totalUsers ??
        users.length;

    return { users, pagination, totalUsers, error: null };
};
