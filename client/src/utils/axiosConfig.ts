import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

instance.defaults.headers.common['Authorization'] =
  `Bearer ${localStorage.getItem('token')}`;
instance.defaults.headers.common['Content-type'] =
  'application/json; charset=UTF-8';

export default instance;
