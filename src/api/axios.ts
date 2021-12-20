import axios from "axios";
import keycloak from "../keycloak";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

// Request interceptor to inject bearer token
api.interceptors.request.use(
  function (config) {
    // Inject Bearer token in every request
    config.headers = {
      Authorization: `Bearer ${keycloak.token}`
    };
    return config;
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response !== undefined && error.response.status === 401) {
      keycloak.logout();
    }
    return Promise.reject(error);
  }
);

export const controller = new AbortController();

export default api;
