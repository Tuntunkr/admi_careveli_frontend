import { get, post, put, del } from "./api_helper";

export const fetchPaymentHistory = async (page = 1, limit = 10, status = '') => {
    let queryParams = `?page=${page}&limit=${limit}`;
    if (status) queryParams += `&status=${status}`;

    try {
        const response = await get(`/api/v1/payment/admin/history${queryParams}`);
        if (response.success) {
            return response;
        } else {
            throw new Error("Failed to fetch data");
        }
    } catch (error) {
        console.error("Error fetching payment history:", error.response?.data?.message || error.message);
        return null;
    }
};
