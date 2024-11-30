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
    return Promise.reject(error);
  },
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      console.error('Interceptor caught status:', status);

      switch (status) {
        case 400:
        case 403:
          console.error('Bad Request');
          window.location.href = '/log-in';
          break;
        case 401:
          console.error('Unauthorized');
          window.location.href = '/log-in';
          break;
        case 404:
          console.error('Not Found');
          break;
        case 500:
          console.error('Internal Server Error');
          break;
        default:
          console.error('Unexpected error');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    // Optionally re-throw the error if further handling is needed
    return Promise.reject(error);
  },
);

export default instance;
