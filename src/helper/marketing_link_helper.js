import * as Utils from "../Utils";

const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Create a new marketing link
 * POST /api/admin/marketing-link/create
 */
export async function createMarketingLink(data) {
    try {
        const response = await fetch(`${Utils.API_URL}admin/marketing-link/create`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating marketing link:", error);
        throw error;
    }
}

/**
 * Get all marketing links with pagination and search
 * GET /api/admin/marketing-link/list
 */
export async function getMarketingLinks(params = {}) {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${Utils.API_URL}admin/marketing-link/list${query ? `?${query}` : ''}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching marketing links:", error);
        throw error;
    }
}

/**
 * Get single marketing link details
 * GET /api/admin/marketing-link/details/:id
 */
export async function getMarketingLinkDetails(id) {
    try {
        const response = await fetch(`${Utils.API_URL}admin/marketing-link/details/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching marketing link details:", error);
        throw error;
    }
}

/**
 * Update marketing link
 * PUT /api/admin/marketing-link/update/:id
 */
export async function updateMarketingLink(id, data) {
    try {
        const response = await fetch(`${Utils.API_URL}admin/marketing-link/update/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating marketing link:", error);
        throw error;
    }
}

/**
 * Delete marketing link
 * DELETE /api/admin/marketing-link/delete/:id
 */
export async function deleteMarketingLink(id) {
    try {
        const response = await fetch(`${Utils.API_URL}admin/marketing-link/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting marketing link:", error);
        throw error;
    }
}

/**
 * Track referral click
 * GET /api/marketing-link/track/:referralCode
 */
export async function trackReferralClick(referralCode) {
    try {
        const response = await fetch(`${Utils.API_URL}marketing-link/track/${referralCode}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error tracking referral click:", error);
        throw error;
    }
}
