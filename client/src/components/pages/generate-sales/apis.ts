import { Order } from './types';
import axiosConfig from '../../../utils/axiosConfig';

const ORDERS_API = '/api/orders';

const generatePayload = (order: Order) => {
  return order;
};

export const createOrder = async (order: Order) => {
  const payload = generatePayload(order);
  const response = await axiosConfig.post(`${ORDERS_API}`, {
    ...payload,
  });

  return response?.data;
};
