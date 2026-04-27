import axios from 'axios';
import {config} from "../config/config";

// Create axios instance
const dashBoardApi = axios.create({
  baseURL: config.DASHBOARD_API_URL,
  headers: {
    'Content-type': 'application/json'
  }
});

export default dashBoardApi;
