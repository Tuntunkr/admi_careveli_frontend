import * as Utils from "../Utils";

// Helper function to get admin token
const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Submit contact form (Public - No auth required)
 * Endpoint: POST /contact/submit
 * @param {Object} contactData - Must contain name, email, message
 */
export async function submitContactForm(contactData) {
    try {
        const response = await fetch(`${Utils.API_URL}contact/submit`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: contactData.name,
                email: contactData.email,
                message: contactData.message
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Error submitting contact form:", error);
        throw error;
    }
}

/**
 * Get all contact messages (Admin only)
 * Endpoint: GET /contact/all
 */
export async function getAllContacts(token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}contact/all`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
    }
}

/**
 * Delete contact message (Admin only)
 * Endpoint: DELETE /contact/delete/:id
 * @param {String} contactId - Contact message ID to delete
 */
export async function deleteContact(contactId, token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}contact/delete/${contactId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
}
