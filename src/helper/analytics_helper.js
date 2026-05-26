import { commonHeader, get } from "./api_helper";

// Fetch Dashboard Summary Stats
export const getDashboardSummary = async (filter) => {
    const query = filter ? `?filter=${filter}` : "";
    return await get(`analytics/summary${query}`);
};

// Fetch Chart Analytics Data
export const getChartAnalytics = async (interval) => {
    const query = interval ? `?interval=${interval}` : "";
    return await get(`analytics/charts${query}`);
};
