import * as Utils from "../Utils";

const getAuthToken = () => localStorage.getItem("adminToken");

const parseJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const analyticsRequest = async (path, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const queryPart = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${Utils.API_URL}analytics/${path}${queryPart}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const error = new Error(data?.message || `Analytics request failed (${response.status})`);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  return data;
};

/**
 * GET /api/analytics/summary
 * @param {string} filter - today | last7days | last30days | thisYear
 */
export async function getDashboardSummary(filter) {
  return analyticsRequest("summary", filter ? { filter } : {});
}

/**
 * GET /api/analytics/charts
 * @param {string} interval - daily | weekly | monthly
 * @param {string} [filter] - optional time filter
 */
export async function getChartAnalytics(interval, filter) {
  const params = {};
  if (interval) params.interval = interval;
  if (filter) params.filter = filter;
  return analyticsRequest("charts", params);
}
