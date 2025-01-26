import { Order } from "../orders/Orders";

export type SalesReport = {
  _id: string;
  date: string;
  total_sales: number;
  order_count: number;
  avg_order_value: number;
  sales_growth: number;
  cancelled_qty: number;
  net_sales: number;
  start_date: string;
  end_date: string;
  orders: Order[];
}

export type GetSalesReportsResponse = {
  start_date: string;
  end_date: string;
  data: SalesReport[];
};
