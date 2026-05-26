import { get, post, upload } from './api_helper';

/**
 * Add a new product
 * @param {FormData} formData - Product data including images
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const addProduct = (formData, token) => {
    return upload('product/add', formData, token);
};

/**
 * Update an existing product
 * @param {FormData} formData - Product data including images and ID
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const updateProduct = (formData, token) => {
    return upload('product/update', formData, token);
};

/**
 * Toggle product status (Active/Inactive)
 * @param {string} productId - Product ID
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const toggleProductStatus = (productId, token) => {
    return post(`product/toggle-status/${productId}`, { token });
};

/**
 * Get all products with filters and pagination
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Promise} API response with products list
 */
export const getAllProducts = (params = {}) => {
    return get('product/list', params);
};

/**
 * Get single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} API response with product details
 */
export const getProductById = (productId) => {
    return get(`product/single/${productId}`, {});
};

/**
 * Remove a product
 * @param {string} productId - Product ID to remove
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const removeProduct = (productId, token) => {
    return post('product/remove', { id: productId }, token);
};

/**
 * Helper function to create FormData for product
 * @param {Object} productData - Product information
 * @param {Object} images - Product images object
 * @returns {FormData} Formatted form data
 */
export const createProductFormData = (productData, images = {}) => {
    const formData = new FormData();

    // Add basic product info
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);

    if (productData.discountPrice !== undefined) {
        formData.append('discountPrice', productData.discountPrice);
    }

    formData.append('category', productData.category);
    formData.append('subCategory', productData.subCategory);
    formData.append('sizes', typeof productData.sizes === 'string' ? productData.sizes : JSON.stringify(productData.sizes));
    formData.append('bestseller', productData.bestseller || false);
    formData.append('stock', productData.stock || 0);

    // Add optional fields
    if (productData.ingredients) {
        formData.append('ingredients', JSON.stringify(productData.ingredients));
    }
    if (productData.benefits) {
        formData.append('benefits', JSON.stringify(productData.benefits));
    }
    if (productData.howToUse) {
        formData.append('howToUse', productData.howToUse);
    }

    // Add images
    Object.keys(images).forEach(key => {
        if (images[key]) {
            formData.append(key, images[key]);
        }
    });

    return formData;
};

/**
 * Validate product form data
 * @param {Object} productData - Product information to validate
 * @param {Array} sizes - Selected sizes
 * @returns {Object} Validation result with isValid and errors
 */
export const validateProductData = (productData, sizes) => {
    const errors = [];

    if (!productData.name || productData.name.trim() === '') {
        errors.push('Product name is required');
    }

    if (!productData.description || productData.description.trim() === '') {
        errors.push('Product description is required');
    }

    if (!productData.price || productData.price <= 0) {
        errors.push('Valid price is required');
    }

    if (!productData.category || productData.category === '') {
        errors.push('Category is required');
    }

    if (!productData.subCategory || productData.subCategory === '') {
        errors.push('Sub category is required');
    }

    if (!sizes || sizes.length === 0) {
        errors.push('At least one size must be selected');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get products with filters and pagination
 * @param {Object} filters - Filter parameters
 * @returns {Promise} API response
 */
export const getProductsWithFilters = (filters) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
            queryParams.append(key, filters[key]);
        }
    });

    return get(`product/list?${queryParams.toString()}`, {});
};

/**
 * Get bestseller products
 * @param {number} limit - Number of products to fetch
 * @returns {Promise} API response
 */
export const getBestsellerProducts = (limit = 10) => {
    return get(`product/bestsellers?limit=${limit}`, {});
};

/**
 * Get latest products
 * @param {number} limit - Number of products to fetch
 * @returns {Promise} API response
 */
export const getLatestProducts = (limit = 10) => {
    return get(`product/latest?limit=${limit}`, {});
};

/**
 * Get categories with product count
 * @returns {Promise} API response
 */
export const getCategories = () => {
    return get('search/categories', {});
};

/**
 * Bulk delete products
 * @param {Array} productIds - Array of product IDs to delete
 * @param {string} token - Admin authentication token
 * @returns {Promise} API response
 */
export const bulkDeleteProducts = async (productIds, token) => {
    const promises = productIds.map(id => removeProduct(id, token));
    return Promise.all(promises);
};

/**
 * Parse ingredients/benefits string to array
 * @param {string} str - Comma-separated string
 * @returns {Array} Array of items
 */
export const parseCommaSeparatedString = (str) => {
    if (!str || typeof str !== 'string') return [];
    return str.split(',').map(item => item.trim()).filter(item => item !== '');
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString('en-IN')}`;
};

/**
 * Check if product is low stock
 * @param {number} stock - Stock quantity
 * @param {number} threshold - Low stock threshold (default: 10)
 * @returns {boolean} True if low stock
 */
export const isLowStock = (stock, threshold = 10) => {
    return stock <= threshold && stock > 0;
};

/**
 * Check if product is out of stock
 * @param {number} stock - Stock quantity
 * @returns {boolean} True if out of stock
 */
export const isOutOfStock = (stock) => {
    return stock <= 0;
};

/**
 * Get product statistics
 * @param {Array} products - Array of products
 * @returns {Object} Statistics object
 */
export const getProductStats = (products) => {
    if (!products || products.length === 0) {
        return {
            total: 0,
            bestsellers: 0,
            lowStock: 0,
            outOfStock: 0,
            totalValue: 0
        };
    }

    return {
        total: products.length,
        bestsellers: products.filter(p => p.bestseller || p.bestSeller).length,
        lowStock: products.filter(p => isLowStock(p.stock)).length,
        outOfStock: products.filter(p => isOutOfStock(p.stock)).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0)
    };
};
