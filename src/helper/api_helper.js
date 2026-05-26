// import axios from "axios";
// import accessToken from "./jwt-token-access/accessToken"

//pass new generated access token here
// const token = accessToken
import * as Utils from "../Utils";
// apply base url for axios
// const API_URL = "https://mehandipurbalaji.app";
const API_URL = Utils.API_URL;

// Helper function to get admin token
const getAuthToken = () => {
  return localStorage.getItem("adminToken");
};

// const axiosApi = axios.create({
//   baseURL: API_URL,
// })

// axiosApi.defaults.headers.common["Authorization"] = token

// axiosApi.interceptors.response.use(
//   response => response,
//   error => Promise.reject(error)
// )

export async function get(url, params = {}) {
  // Extract token from params if passed, otherwise use default
  const token = params.token || getAuthToken();
  const tokenHeader = token ? `Bearer ${token}` : "";

  // Remove token from params for building query string
  const queryParams = { ...params };
  delete queryParams.token;

  // Build query string from params object
  const queryString = new URLSearchParams();
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] !== undefined && queryParams[key] !== null) {
      queryString.append(key, queryParams[key]);
    }
  });

  const queryPart = queryString.toString() ? `?${queryString.toString()}` : "";
  const fullUrl = API_URL + url + queryPart;

  console.log('API GET Request:', {
    url: fullUrl,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
  });

  return fetch(fullUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      "Authorization": tokenHeader
    },
  })
    .then(res => {
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      return res.json();
    })
    .then(data => {
      console.log('Parsed response data:', data);
      return data;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });

}

export async function download(url, data) {
  const token = data?.token || getAuthToken();
  // return await axiosApi.get(url, { ...config }).then(response => response.data)
  return fetch(API_URL + url, {
    method: 'GET',
    headers: {
      // mode: 'no-cors',
      Accept: 'application/zip',
      'Content-Type': 'application/json',
      "Authorization": token ? `Bearer ${token}` : ""
    },
    // body: JSON.stringify(data)
  }).then(res => res.blob())

}

export async function post(url, data) {
  const token = data?.token || getAuthToken();
  console.log('post method req', url, data)
  return fetch(API_URL + url, {
    method: 'POST',
    headers: {
      // mode: 'no-cors',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  }).then(res => res.json())
  // .post(API_URL+url, { ...data }, { ...config })
  // .then(response => response.data)
}

export async function put(url, data) {
  const token = data?.token || getAuthToken();
  console.log('put method req', url, data)
  return fetch(API_URL + url, {
    method: 'PUT',
    headers: {
      // mode: 'no-cors',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  }).then(res => res.json())
}

export async function upload(url, data, token) {
  const authToken = token || getAuthToken();
  console.log('upload method req', url, data)
  // for (const [key, value] of data) {
  //   console.log('form data before hitting', `${key}: ${value}\n`);
  // }

  const headers = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return fetch(API_URL + url, {
    method: 'POST',
    headers: headers,
    // mode: 'no-cors',
    // headers: {
    //   mode: 'no-cors',
    //   "Content-Type": "multipart/form-data",
    // "Accept": "application/json",
    //   "type": "formData",
    //   "Authorization": "Bareer " + token
    // },
    body: data
  }).then(res => res.json())
}

export async function patch(url, data) {
  const token = data?.token || getAuthToken();
  console.log('patch method req', url, data)
  return fetch(API_URL + url, {
    method: 'PATCH',
    headers: {
      // mode: 'no-cors',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  }).then(res => res.json())
}

export async function del(url, data) {
  const token = data?.token || getAuthToken();
  console.log('delete method req', url, data)
  return fetch(API_URL + url, {
    method: 'DELETE',
    headers: {
      // mode: 'no-cors',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  }).then(res => res.json())
}
