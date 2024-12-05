import axiosConfig from '../../../utils/axiosConfig';

const ORDERS_API = '/api/orders';

export const fetchOrders = async ({ company_id }: { company_id: string }) => {
  const response = await axiosConfig.get(
    `${ORDERS_API}?company_id=${company_id}`,
  );
  return response?.data;
};
