import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

instance.defaults.headers.common['Content-type'] =
  'application/json; charset=UTF-8';

// Set up an Axios request interceptor to add the Bearer token to all requests
instance.interceptors.request.use(
  (config) => {
    // Retrieve the token (e.g., from localStorage)
    const token = localStorage.getItem('token');
    
    // If a token exists, set the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // Return the config so the request can continue
  },
  (error) => {
    if (error?.response?.status === 403) {
      window.location.href = '/log-in'
    }
    return Promise.reject(error);
  }
);

export default instance;
