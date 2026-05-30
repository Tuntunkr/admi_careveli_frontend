import * as Utils from "../Utils";

const getAuthToken = () => localStorage.getItem("adminToken");

/**
 * GET /api/v1/payment/admin/history
 */
export async function fetchPaymentHistory(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const queryPart = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(
    `${Utils.API_URL}v1/payment/admin/history${queryPart}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || "Failed to fetch payment history");
    error.response = data;
    throw error;
  }

  return data;
}
