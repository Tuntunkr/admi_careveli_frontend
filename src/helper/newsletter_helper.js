import * as Utils from "../Utils";

// Helper function to get admin token
const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

/**
 * Subscribe to newsletter (Public - No auth required)
 * Endpoint: POST /newsletter/subscribe
 * @param {String} email - Email address to subscribe
 */
export async function subscribeNewsletter(email) {
    try {
        const response = await fetch(`${Utils.API_URL}newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        return await response.json();
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        throw error;
    }
}

/**
 * Get all newsletter subscribers (Admin only)
 * Endpoint: GET /newsletter/subscribers
 */
export async function getAllSubscribers(token) {
    const authToken = token || getAuthToken();
    try {
        const response = await fetch(`${Utils.API_URL}newsletter/subscribers`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'token': authToken
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        throw error;
    }
}

/**
 * Export subscribers to CSV
 * @param {Array} subscribers - Array of subscriber objects
 */
export function exportSubscribersToCSV(subscribers) {
    if (!subscribers || subscribers.length === 0) {
        return null;
    }

    // Create CSV headers
    const headers = ['Email', 'Subscribed Date', 'Status'];

    // Create CSV rows
    const rows = subscribers.map(subscriber => {
        const date = new Date(subscriber.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        return [
            subscriber.email,
            date,
            subscriber.isActive ? 'Active' : 'Inactive'
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
export function downloadCSV(csvContent, filename = 'newsletter_subscribers.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}
