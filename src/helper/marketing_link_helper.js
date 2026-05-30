import * as Utils from "../Utils";

const getAuthToken = () => localStorage.getItem("adminToken");

const parseJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const adminRequest = async (path, options = {}) => {
  const response = await fetch(`${Utils.API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  return data;
};

/**
 * POST /api/admin/marketing-link/create
 */
export async function createMarketingLink(data) {
  return adminRequest("admin/marketing-link/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * GET /api/admin/marketing-link/list
 */
export async function getMarketingLinks(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const queryPart = query.toString() ? `?${query.toString()}` : "";
  return adminRequest(`admin/marketing-link/list${queryPart}`, { method: "GET" });
}

/**
 * GET /api/admin/marketing-link/details/:id
 */
export async function getMarketingLinkDetails(id) {
  return adminRequest(`admin/marketing-link/details/${id}`, { method: "GET" });
}

/**
 * PUT /api/admin/marketing-link/update/:id
 */
export async function updateMarketingLink(id, data) {
  return adminRequest(`admin/marketing-link/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE /api/admin/marketing-link/delete/:id
 */
export async function deleteMarketingLink(id) {
  return adminRequest(`admin/marketing-link/delete/${id}`, {
    method: "DELETE",
  });
}

/**
 * GET /api/marketing-link/track/:trackingCode
 */
export async function trackReferralClick(trackingCode) {
  const encoded = encodeURIComponent(trackingCode);
  const response = await fetch(
    `${Utils.API_URL}marketing-link/track/${encoded}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const error = new Error(data?.message || `Track failed (${response.status})`);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

export function normalizeMarketingLinksList(res) {
  if (Array.isArray(res)) return res;

  const candidates = [
    res?.data?.links,
    res?.data?.marketingLinks,
    res?.data?.items,
    res?.data?.list,
    res?.data,
    res?.links,
    res?.marketingLinks,
  ];

  return candidates.find((item) => Array.isArray(item)) || [];
}

export function normalizeMarketingLinkPagination(res) {
  const p = res?.pagination || res?.data?.pagination;
  if (!p) return { page: 1, pages: 1, total: 0, limit: 10 };
  return {
    page: Number(p.page) || 1,
    pages: Number(p.pages) || Number(p.totalPages) || 1,
    total: Number(p.total) || 0,
    limit: Number(p.limit) || 10,
  };
}

export function normalizeMarketingLinkDetail(res) {
  return res?.data?.link || res?.data?.marketingLink || res?.data || res?.link || res;
}
