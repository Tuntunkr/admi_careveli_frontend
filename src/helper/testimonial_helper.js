import * as Utils from "../Utils";

// Helper function to get admin token
const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Get all active testimonials (Public - No auth required)
 * Endpoint: GET /v1/testimonials/active
 * @param {Object} params - Query parameters { page, limit, rating }
 */
export async function getActiveTestimonials(params = {}) {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.rating) queryParams.append('rating', params.rating);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const response = await fetch(`${Utils.API_URL}v1/testimonials/active${queryString}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching active testimonials:", error);
        throw error;
    }
}

/**
 * Get single testimonial by ID (Public)
 * Endpoint: GET /v1/testimonials/:id
 * @param {String} id - Testimonial ID
 */
export async function getTestimonialById(id) {
    try {
        const response = await fetch(`${Utils.API_URL}v1/testimonials/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching testimonial:", error);
        throw error;
    }
}

/**
 * Get all testimonials (Admin only)
 * Endpoint: GET /v1/testimonials/all
 * @param {Object} params - Query parameters { page, limit, isActive, isDeleted }
 * @param {String} token - Admin token
 */
export async function getAllTestimonials(params = {}, token) {
    const authToken = token || getAuthToken();
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
        if (params.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const url = `${Utils.API_URL}v1/testimonials/all${queryString}`;

        console.log('Fetching testimonials from:', url);
        console.log('Auth token present:', !!authToken);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        const data = await response.json();
        console.log('Response data:', data);

        return data;
    } catch (error) {
        console.error("Error fetching all testimonials:", error);
        throw error;
    }
}

/**
 * Create new testimonial (Admin only)
 * Endpoint: POST /v1/testimonials/create
 * @param {FormData} formData - Form data with name, rating, title, review, profileImage, isVerified
 * @param {String} token - Admin token
 */
export async function createTestimonial(formData, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/testimonials/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating testimonial:", error);
        throw error;
    }
}

/**
 * Update testimonial (Admin only)
 * Endpoint: PUT /v1/testimonials/update/:id
 * @param {String} id - Testimonial ID
 * @param {FormData} formData - Form data with fields to update
 * @param {String} token - Admin token
 */
export async function updateTestimonial(id, formData, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/testimonials/update/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating testimonial:", error);
        throw error;
    }
}

/**
 * Soft delete testimonial (Admin only)
 * Endpoint: DELETE /v1/testimonials/delete/:id
 * @param {String} id - Testimonial ID
 * @param {String} token - Admin token
 */
export async function deleteTestimonial(id, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/testimonials/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        throw error;
    }
}

/**
 * Permanent delete testimonial (Admin only)
 * Endpoint: DELETE /v1/testimonials/permanent-delete/:id
 * @param {String} id - Testimonial ID
 * @param {String} token - Admin token
 */
export async function permanentDeleteTestimonial(id, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/testimonials/permanent-delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error permanently deleting testimonial:", error);
        throw error;
    }
}

/**
 * Toggle testimonial status (Admin only)
 * Endpoint: PATCH /v1/testimonials/toggle-status/:id
 * @param {String} id - Testimonial ID
 * @param {String} token - Admin token
 */
export async function toggleTestimonialStatus(id, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/testimonials/toggle-status/${id}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error toggling testimonial status:", error);
        throw error;
    }
}

/**
 * Export testimonials to CSV
 * @param {Array} testimonials - Array of testimonial objects
 */
export function exportTestimonialsToCSV(testimonials) {
    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    // Create CSV headers
    const headers = ['Name', 'Rating', 'Title', 'Review', 'Verified', 'Status', 'Created Date'];

    // Create CSV rows
    const rows = testimonials.map(testimonial => {
        const date = new Date(testimonial.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        return [
            `"${testimonial.name}"`,
            testimonial.rating,
            `"${testimonial.title || ''}"`,
            `"${testimonial.review || ''}"`,
            testimonial.isVerified ? 'Yes' : 'No',
            testimonial.isActive ? 'Active' : 'Inactive',
            date
        ];
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

    return csvContent;
}

/**
 * Download CSV file
 * @param {String} csvContent - CSV content string
 * @param {String} filename - Name for the downloaded file
 */
export function downloadCSV(csvContent, filename = 'testimonials.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}
