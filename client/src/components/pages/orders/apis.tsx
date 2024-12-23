import axiosConfig from '../../../utils/axiosConfig';

const ORDERS_API = '/api/orders';

export const fetchOrders = async ({
  company_id,
  status,
}: {
  company_id: string;
  status?: string;
}) => {
  const response = await axiosConfig.get(`${ORDERS_API}`, {
    params: { company_id, status },
  });
  return response?.data;
};
