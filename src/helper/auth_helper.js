/**
 * Authentication Helper Functions
 * Handles admin authentication, token management, and session validation
 */

/**
 * Get the stored admin token
 * @returns {string|null} The admin token or null
 */
export const getAdminToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Get the stored admin user data
 * @returns {object|null} The admin user object or null
 */
export const getAdminUser = () => {
    const user = localStorage.getItem("adminUser");
    return user ? JSON.parse(user) : null;
};

/**
 * Save admin authentication data
 * @param {string} token - JWT token
 * @param {object} user - User data object
 */
export const setAdminAuth = (token, user) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
};

/**
 * Clear admin authentication data
 */
export const clearAdminAuth = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
};

/**
 * Check if admin is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
    const token = getAdminToken();
    const user = getAdminUser();
    return !!(token && user);
};

/**
 * Check if the user has admin role
 * @returns {boolean} True if user is admin, false otherwise
 */
export const isAdmin = () => {
    const user = getAdminUser();
    return user?.role === "Admin";
};

/**
 * Get authorization headers for API requests
 * @returns {object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
    const token = getAdminToken();
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

/**
 * Handle API response for authentication errors
 * @param {object} response - API response object
 * @returns {boolean} True if should logout, false otherwise
 */
export const handleAuthError = (response) => {
    // Check for common authentication error patterns
    if (response?.status === 401 ||
        response?.message?.toLowerCase().includes('unauthorized') ||
        response?.message?.toLowerCase().includes('token') ||
        response?.message?.toLowerCase().includes('expired')) {
        clearAdminAuth();
        return true;
    }
    return false;
};
