import axios from 'axios';

// Create axios instance
const dashBoardApi = axios.create({
  baseURL: process.env.REACT_APP_DASHBOARD_API_URL,
  headers: {
    'Content-type': 'application/json'
  }
});

export default dashBoardApi;
