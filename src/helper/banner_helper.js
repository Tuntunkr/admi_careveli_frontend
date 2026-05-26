import * as Utils from "../Utils";

// Helper function to get admin token
const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Get all active banners (Public - No auth required)
 * Endpoint: GET /banner/all
 */
export async function getAllActiveBanners() {
    try {
        const response = await fetch(`${Utils.API_URL}banner/all`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching active banners:", error);
        throw error;
    }
}

/**
 * Get all banners including inactive (Admin only)
 * Endpoint: GET /banner/admin/all
 */
export async function getAllBannersAdmin(token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}banner/admin/all`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching all banners:", error);
        throw error;
    }
}

/**
 * Get banner list (Admin only)
 * Endpoint: GET /banner/admin/list
 */
export async function getBannerList(token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}banner/admin/list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching banner list:", error);
        throw error;
    }
}

/**
 * Get single banner by ID
 * Endpoint: GET /banner/:id
 */
export async function getBannerById(bannerId) {
    try {
        const response = await fetch(`${Utils.API_URL}banner/${bannerId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching banner:", error);
        throw error;
    }
}

/**
 * Add new banner (Admin only)
 * Endpoint: POST /banner/add
 * @param {FormData} formData - Must contain 'image' file and optional 'title', 'isActive'
 */
export async function addBanner(formData, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}banner/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding banner:", error);
        throw error;
    }
}

/**
 * Update banner (Admin only)
 * Endpoint: PUT /banner/update/:id
 * @param {string} bannerId - Banner ID to update
 * @param {FormData} formData - Can contain 'image' file, 'title', 'isActive'
 */
export async function updateBanner(bannerId, formData, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}banner/update/${bannerId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
}

/**
 * Delete banner (Admin only)
 * Endpoint: DELETE /banner/delete/:id
 */
export async function deleteBanner(bannerId, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}banner/delete/${bannerId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting banner:", error);
        throw error;
    }
}

/**
 * Toggle banner status (Admin only)
 * Endpoint: PATCH /banner/toggle/:id
 */
export async function toggleBannerStatus(bannerId, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}banner/toggle/${bannerId}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error toggling banner status:", error);
        throw error;
    }
}
