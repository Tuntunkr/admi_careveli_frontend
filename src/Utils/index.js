export const projectName = "Careveli";
export const themeColor = "#f23636";
export const API_URL = "https://careveli-backend.vercel.app/api/";
export const BASE_URL = "https://careveli-backend.vercel.app/";
export const STORE_FRONT_URL = process.env.REACT_APP_STORE_URL || "https://www.careveli.com";

export const SHIPCLUES_API_URL = process.env.REACT_APP_SHIPCLUES_API_URL || "https://api.shipclues.in";
export const SHIPCLUES_API_TOKEN =
    process.env.REACT_APP_SHIPCLUES_API_TOKEN ||
    '34c80487540732968a3f7edf9ca551b7f0f807473709cd2e44a27823d7cdf8fd';
export const SHIPCLUES_WAREHOUSE_ID = Number(process.env.REACT_APP_SHIPCLUES_WAREHOUSE_ID || 15642);

export const SHIPCLUES_DEFAULTS = {
    packageLength: "14.5",
    packageBreadth: "15",
    packageHeight: "8.5",
    packageWeightGm: "60.00",
    gstRate: "18.00",
};
// export const API_URL = "http://localhost:8088/api/";
// export const BASE_URL = "http://localhost:8088/";

/**
 * Normalize image input to a string path/URL
 * @param {string|object|Array} imageInput - Image path from API
 * @returns {string} Normalized image path or URL
 */
const normalizeImagePath = (imageInput) => {
    if (!imageInput) return '';

    let path = imageInput;

    if (Array.isArray(path)) {
        path = path[0];
    }

    if (path && typeof path === 'object') {
        path = path.url || path.path || path.src || path.image || path.secure_url || '';
    }

    if (typeof path !== 'string') {
        return path ? String(path) : '';
    }

    return path.trim();
};

/**
 * Get full image URL from relative or absolute path
 * @param {string|object|Array} imagePath - Image path from API
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
    const path = normalizeImagePath(imagePath);

    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};
