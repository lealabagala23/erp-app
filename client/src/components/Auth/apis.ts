import axiosConfig from '../../utils/axiosConfig';

const AUTH_API = '/api/auth';
const COMPANIES_API = '/api/companies';
const SUPPLIERS_API = '/api/suppliers';
const INVENTORY_API = '/api/inventory';

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
  const response = await axiosConfig.get(`${AUTH_API}/me`);
  return response?.data;
};

export const fetchCompanies = async () => {
  const response = await axiosConfig.get(`${COMPANIES_API}`);
  return response?.data;
};

export const fetchSuppliers = async () => {
  const response = await axiosConfig.get(`${SUPPLIERS_API}`);
  return response?.data;
};

export const fetchExpiringStocks = async ({
  company_id,
}: {
  company_id: string;
}) => {
  const response = await axiosConfig.get(
    `${INVENTORY_API}?company_id=${company_id}&expiring=soon`,
  );
  return response?.data;
};
