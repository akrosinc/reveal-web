import axios from "axios";
import { getFromBrowser } from '../utils'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

// Add a request interceptor
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

// Add a response interceptor to handle erros
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default api;
