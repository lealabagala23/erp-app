export const FETCH_ORDER_BY_ID_QUERY_KEY = 'fetchOrderById';

export enum OrderStatus {
  DRAFT = 'draft',
  FOR_APPROVAL = 'for_approval',
  FOR_PRINTING = 'for_printing',
  UNPAID = 'unpaid',
  COMPLETED = 'completed',
}

export const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DRAFT:
      return 'default';
    case OrderStatus.FOR_APPROVAL:
      return 'info';
    case OrderStatus.FOR_PRINTING:
      return 'primary';
    case OrderStatus.UNPAID:
      return 'warning';
    case OrderStatus.COMPLETED:
      return 'success';
  }
};
