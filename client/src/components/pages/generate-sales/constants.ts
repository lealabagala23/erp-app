export const FETCH_ORDER_BY_ID_QUERY_KEY = 'fetchOrderById';
export const FETCH_REFERRERS_QUERY_KEY = 'fetchReferrers';

export enum OrderStatus {
  DRAFT = 'draft',
  UNAPPROVED = 'unapproved',
  APPROVED = 'approved',
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DRAFT:
      return 'default';
    case OrderStatus.UNAPPROVED:
      return 'info';
    case OrderStatus.APPROVED:
      return 'primary';
    case OrderStatus.UNPAID:
      return 'warning';
    case OrderStatus.PARTIALLY_PAID:
      return 'warning';
    case OrderStatus.COMPLETED:
      return 'success';
    case OrderStatus.CANCELLED:
      return 'error';
  }
};
