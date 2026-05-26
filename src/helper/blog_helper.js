import * as Utils from "../Utils";
import { get, post, patch, del, upload } from './api_helper';

// Helper function to get admin token
const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Get all active blogs (Public - No auth required)
 * Endpoint: GET /blogs/list
 */
export async function getAllActiveBlogs() {
    try {
        const response = await fetch(`${Utils.API_URL}blogs/list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching active blogs:", error);
        throw error;
    }
}

/**
 * Get all blogs including inactive (Admin only)
 * Endpoint: GET /blogs/admin/list
 */
export async function getAllBlogsAdmin(token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/blogs/admin/list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching all blogs:", error);
        throw error;
    }
}

/**
 * Get single blog by ID (Public - No auth required)
 * Endpoint: GET /blogs/:id
 */
export async function getBlogById(blogId) {
    try {
        const response = await fetch(`${Utils.API_URL}blogs/${blogId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching blog details:", error);
        throw error;
    }
}

/**
 * Add a new blog (Admin only)
 * Endpoint: POST /blogs/add
 * @param {FormData} formData - Must contain 'image' file and optional 'title', 'desc'
 * @param {string} token - Admin authentication token
 */
export async function addBlog(formData, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/blogs/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'token': authToken
            },
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding blog:", error);
        throw error;
    }
}

/**
 * Update an existing blog (Admin only)
 * Endpoint: PUT /blogs/update/:id
 * @param {string} blogId - Blog ID to update
 * @param {FormData} formData - Can contain 'image' file, 'title', 'desc', 'isActive'
 * @param {string} token - Admin authentication token
 */
export async function updateBlog(blogId, formData, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/blogs/update/${blogId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'token': authToken
            },
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating blog:", error);
        throw error;
    }
}

/**
 * Toggle Blog Status (Admin only)
 * Endpoint: PUT /blogs/toggle-status/:id
 * @param {string} blogId - Blog ID to toggle
 * @param {string} token - Admin authentication token
 */
export async function toggleBlogStatus(blogId, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/blogs/toggle-status/${blogId}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error toggling blog status:", error);
        throw error;
    }
}

/**
 * Delete a blog (Admin only)
 * Endpoint: DELETE /blogs/delete/:id
 * @param {string} blogId - Blog ID to delete
 * @param {string} token - Admin authentication token
 */
export async function deleteBlog(blogId, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}v1/blogs/delete/${blogId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'token': authToken
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting blog:", error);
        throw error;
    }
}
