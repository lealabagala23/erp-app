import axiosConfig from '../../../utils/axiosConfig';
import { Order } from './Orders';

const ORDERS_API = '/api/orders';

export const fetchOrders = async ({
  company_id,
  status,
  hideEmptyInvoices,
}: {
  company_id: string;
  status?: string;
  hideEmptyInvoices?: boolean;
}) => {
  const response = await axiosConfig.get(`${ORDERS_API}`, {
    params: { company_id, status },
  });
  const data = response?.data;
  return hideEmptyInvoices
    ? data.filter(
        // eslint-disable-next-line
        ({ customer_id }: { customer_id: any }) =>
          Object.keys(customer_id).length !== 0,
      )
    : data;
};

export const deleteOrder = async (order: Order) => {
  const response = await axiosConfig.delete(`${ORDERS_API}/${order._id}`);

  return response?.data;
};
