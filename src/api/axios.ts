import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-type': 'application/json'
  }
});

export default api;
