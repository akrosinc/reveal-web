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
  let instanceId = null
  
    const requiresInstance =
    config?.url?.includes('groupmanagement') ||
    config?.url?.includes('instance/assigned/user/list') ||
    config?.url?.includes('instance/assigned/dataset/list') ||
    config?.url?.includes('instance/assigned/area/tree') ||
    config?.url?.includes('instance/roles/list');
    console.log(config.url)
    console.log(requiresInstance)
  if(requiresInstance){
  const rawCurrentInstance= localStorage.getItem('currentInstance')
  instanceId=rawCurrentInstance? JSON.parse(rawCurrentInstance):null
  }
  config.headers = {
   
    ...(requiresInstance && {
      'X-Instance-ID':instanceId?.selectedInstance?.identifier
    }),
     Authorization: `Bearer ${keycloak.token}`,
  };
  return config;
});

export default api;
