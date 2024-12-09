export type OrderItem = {
  item_number?: number;
  order_id: string;
  product_id: string | { _id: string; product_name: string };
  quantity: number;
  unit_price: number;
  custom_discount: number;
  total_price: number;
  created_at?: string;
  _id?: string;
};

export type TableItem = {
  item_number: number;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  custom_discount: number;
  total_price: number;
  _id?: string;
};
