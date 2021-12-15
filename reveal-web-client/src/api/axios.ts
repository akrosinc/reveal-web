import axios from "axios";
import { getFromBrowser, removeFromBrowser } from '../utils'
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
    const token = getFromBrowser("token");
    config.headers = {
      Authorization: `Bearer ${token}`
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
    if (error.response.status === 401) {
      removeFromBrowser("token");
      keycloak.logout();
    }
    return Promise.reject(error);
  }
);

export default api;
