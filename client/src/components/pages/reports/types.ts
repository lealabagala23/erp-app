export type GetSalesReportsResponse = {
  startDate: string;
  endDate: string;
  data: {
    _id: string;
    date: string;
    total_sales: number;
    order_count: number;
    avg_order_value: number;
    sales_growth: number;
    cancelled_qty: number;
    net_sales: number;
  }[];
};
