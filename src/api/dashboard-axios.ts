import axios from 'axios';
import keycloak from '../keycloak';

// Create axios instance
const dashBoardApi = axios.create({
  baseURL: process.env.REACT_APP_DASHBOARD_API_URL,
  headers: {
    'Content-type': 'application/json'
  }
});

dashBoardApi.interceptors.request.use(function (config) {
  // Inject Bearer token in every request
  config.headers = {
    Authorization: `Bearer ${keycloak.token}`
  };
  return config;
});

export default dashBoardApi;
