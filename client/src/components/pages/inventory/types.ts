export type Product = {
  _id?: string;
  barcode?: string;
  product_name: string;
  product_description: string;
  product_unit: string;
  generic_name?: string;
  purchase_price: number;
  unit_price: number;
  stocks: { [key: string]: Inventory[] };
  total_quantity_on_hand: { [key: string]: number };
  created_at?: string;
};

export type Inventory = {
  _id?: string;
  product_id?: string | Product;
  stock_arrival_date: string;
  quantity_on_hand?: number;
  quantity_on_order: number;
  batch_number: string;
  expiry_date: string;
  status: string;
  company_id?: string;
  supplier_id: {
    _id: string;
    supplier_name: string;
  } | string;
  created_at?: string;
}