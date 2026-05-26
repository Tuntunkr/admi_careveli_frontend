import * as Utils from "../Utils";

// Helper function to get admin token
const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Get all active categories (Public - No auth required)
 * Endpoint: GET /category/list
 */
export async function getAllActiveCategories() {
    try {
        const response = await fetch(`${Utils.API_URL}category/list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching active categories:", error);
        throw error;
    }
}

/**
 * Get category list (Admin only)
 * Endpoint: GET /category/admin/list
 */
export async function getCategoryList(token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}category/admin/list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken // Added per API spec
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching category list:", error);
        throw error;
    }
}

/**
 * Get single category by ID
 * Endpoint: GET /category/:id
 */
export async function getCategoryById(categoryId) {
    try {
        const response = await fetch(`${Utils.API_URL}category/${categoryId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
    }
}

/**
 * Add new category (Admin only)
 * Endpoint: POST /category/add
 */
export async function addCategory(data, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}category/add`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken // Added per API spec
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding category:", error);
        throw error;
    }
}

/**
 * Update category (Admin only)
 * Endpoint: PUT /category/update/:id
 */
export async function updateCategory(categoryId, data, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}category/update/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken // Added per API spec
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
}

/**
 * Delete category (Admin only)
 * Endpoint: DELETE /category/delete/:id
 */
export async function deleteCategory(categoryId, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}category/delete/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken // Added per API spec
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}

/**
 * Toggle category status (Admin only)
 * Endpoint: PATCH /category/toggle-status/:id
 */
export async function toggleCategoryStatus(categoryId, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}category/toggle-status/${categoryId}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken // Added per API spec
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error toggling category status:", error);
        throw error;
    }
}
