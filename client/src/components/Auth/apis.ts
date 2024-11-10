import axiosConfig from '../../utils/axiosConfig';

const AUTH_API = '/api/auth';

export const fetchLogin = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await axiosConfig.post(`${AUTH_API}/login`, {
    username,
    password,
  });

  return response?.data;
};

export const signUp = async ({
  first_name,
  last_name,
  username,
  password,
}: {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
}) => {
  const response = await axiosConfig.post(`${AUTH_API}/register`, {
    first_name,
    last_name,
    username,
    password,
  });

  return response?.data;
};

export const fetchUserInfo = async () => {
  const response = await axiosConfig.get(`${AUTH_API}/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response?.data;
};
