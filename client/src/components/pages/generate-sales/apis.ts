import { CancelItem, Order, OrderItem, Payment } from './types';
import axiosConfig from '../../../utils/axiosConfig';

const ORDERS_API = '/api/orders';

const getOrderItemPayload = ({
  _id,
  product_id,
  inventory_id,
  quantity,
  unit_price,
  total_price,
}: OrderItem) => ({
  _id,
  product_id,
  inventory_id,
  quantity,
  unit_price,
  total_price,
});

// eslint-disable-next-line
const removeEmptyStrings = (obj: any) =>
  Object.fromEntries(
    // eslint-disable-next-line
    Object.entries(obj).filter(([_, value]) => value !== ''),
  );

const generatePayload = ({
  _id,
  customer_id,
  invoice_number,
  tin,
  billing_address,
  payment_type,
  status,
  discount_card,
  discount_card_number,
  sc_pwd_discount,
  vat_exempted,
  special_discount,
  initiator_id,
  company_id,
  referrer_id,
  referring_doctor_id,
  approver_id,
  order_items,
}: Order) => {
  return removeEmptyStrings({
    _id,
    customer_id,
    invoice_number,
    tin,
    billing_address,
    payment_type,
    status,
    discount_card,
    discount_card_number,
    sc_pwd_discount,
    vat_exempted,
    special_discount,
    initiator_id,
    company_id,
    referrer_id,
    referring_doctor_id,
    approver_id,
    order_items: (order_items || []).map(getOrderItemPayload),
  });
};

export const createOrder = async (order: Order) => {
  const payload = generatePayload(order);
  const response = await axiosConfig.post(`${ORDERS_API}`, {
    ...payload,
  });

  return response?.data;
};

export const fetchOrderById = async ({ id }: { id: string }) => {
  const response = await axiosConfig.get(`${ORDERS_API}/${id}`);

  return response?.data;
};

export const updateOrder = async (order: Order) => {
  const payload = generatePayload(order);
  const response = await axiosConfig.put(`${ORDERS_API}/${order._id}`, {
    ...payload,
  });

  return response?.data;
};

export const updateOrderStatus = async (order: Order) => {
  const response = await axiosConfig.put(`${ORDERS_API}/${order._id}/status`, {
    status: order.status,
  });

  return response?.data;
};

export const addOrderPayment = async ({ order_id, ...payload }: Payment) => {
  const response = await axiosConfig.put(`${ORDERS_API}/${order_id}/payment`, {
    ...payload,
  });

  return response?.data;
};

export const cancelOrder = async ({
  order_id,
  cancel_items,
  cancel_all,
}: {
  order_id: string;
  cancel_items: CancelItem[];
  cancel_all?: boolean;
}) => {
  const response = await axiosConfig.put(`${ORDERS_API}/${order_id}/cancel`, {
    cancel_items,
    cancel_all,
  });

  return response?.data;
};
