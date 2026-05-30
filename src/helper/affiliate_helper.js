import * as Utils from "../Utils";

const getAuthToken = () => localStorage.getItem("adminToken");

/**
 * GET /api/v1/affiliate/all
 */
export async function getAffiliateUsers(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const queryPart = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${Utils.API_URL}v1/affiliate/all${queryPart}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return response.json();
}

/**
 * PATCH /api/v1/affiliate/{affiliateId}/status
 * Body: { status: "active" | "inactive" }
 */
export async function updateAffiliateStatus(affiliateId, status) {
  const response = await fetch(
    `${Utils.API_URL}v1/affiliate/${affiliateId}/status`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || "Failed to update affiliate status");
    error.response = data;
    throw error;
  }

  return data;
}
