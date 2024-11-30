import axiosConfig from '../../../utils/axiosConfig';
import { Customer } from './types';

const CUSTOMERS_API = '/api/customers';

const generatePayload = (customer: Customer) => {
  return { ...customer };
};

export const fetchCustomers = async () => {
  const response = await axiosConfig.get(`${CUSTOMERS_API}`);
  return response?.data;
};

export const createCustomer = async (customer: Customer) => {
  const payload = generatePayload(customer);
  const response = await axiosConfig.post(`${CUSTOMERS_API}`, {
    ...payload,
  });

  return response?.data;
};

// eslint-disable-next-line
export const uploadCustomersCSV = async (payload: any) => {
  const response = await axiosConfig.post(`${CUSTOMERS_API}/bulk`, 
    JSON.stringify(payload)
  );

  return response?.data;
};

export const updateCustomer = async (customer: Customer) => {
  const payload = generatePayload(customer);
  const response = await axiosConfig.put(`${CUSTOMERS_API}/${customer._id}`, {
    ...payload,
  });

  return response?.data;
};

export const deleteCustomer = async (customer: Customer) => {
  const response = await axiosConfig.delete(`${CUSTOMERS_API}/${customer._id}`);

  return response?.data;
};
