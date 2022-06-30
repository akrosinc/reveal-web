import axios from 'axios';
import keycloak from '../keycloak';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-type': 'application/json'
  }
});

api.interceptors.request.use(function (config) {
  // Inject Bearer token in every request
  config.headers = {
    Authorization: `Bearer ${keycloak.token}`
  };
  return config;
});

export default api;
