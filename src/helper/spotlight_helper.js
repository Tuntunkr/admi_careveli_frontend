import * as Utils from "../Utils";

const getAuthToken = () => localStorage.getItem("adminToken");

const parseJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const isSpotlightApiSuccess = (res) =>
  res?.statusCode === 200 || res?.success === true;

export const normalizeSpotlightList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.spotlights)) return res.spotlights;
  if (Array.isArray(res?.data?.spotlights)) return res.data.spotlights;
  return [];
};

export const normalizeSpotlightDetail = (res) =>
  res?.data?.spotlight || res?.data || res?.spotlight || res;

const authHeaders = (json = true) => {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
};

const handleResponse = async (response) => {
  const data = await parseJsonResponse(response);
  if (!response.ok && !isSpotlightApiSuccess(data)) {
    const error = new Error(data?.message || data?.error || `Request failed (${response.status})`);
    error.response = data;
    error.status = response.status;
    throw error;
  }
  return data;
};

/**
 * GET /api/spotlight/admin/list
 */
export async function getAdminSpotlightList() {
  const response = await fetch(`${Utils.API_URL}spotlight/admin/list`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

/**
 * GET /api/spotlight/{id}
 */
export async function getSpotlightById(id) {
  const response = await fetch(`${Utils.API_URL}spotlight/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

/**
 * POST /api/spotlight/add
 */
export async function addSpotlight(formData) {
  const response = await fetch(`${Utils.API_URL}spotlight/add`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });
  return handleResponse(response);
}

/**
 * PUT /api/spotlight/update/{id}
 */
export async function updateSpotlight(id, formData) {
  const response = await fetch(`${Utils.API_URL}spotlight/update/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });
  return handleResponse(response);
}

/**
 * DELETE /api/spotlight/delete/{id}
 */
export async function deleteSpotlight(id) {
  const response = await fetch(`${Utils.API_URL}spotlight/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

/**
 * PATCH /api/spotlight/toggle-status/{id}
 */
export async function toggleSpotlightStatus(id) {
  const response = await fetch(`${Utils.API_URL}spotlight/toggle-status/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export function getSpotlightVideoUrl(video) {
  if (!video) return "";
  if (typeof video === "string" && (video.startsWith("http://") || video.startsWith("https://"))) {
    return video;
  }
  return Utils.getImageUrl(video);
}
