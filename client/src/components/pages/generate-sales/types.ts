import { Customer } from "../accounts/types";

export type OrderItem = {
  order_id: string;
  product_id: string | { _id: string; product_name: string; product_description: string; product_unit: string };
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
  _id?: string;
};

export type TableItem = {
  item_number: number;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  _id?: string;
};

export type Order = {
  _id?: string;
  customer_id?: string | Customer;
  invoice_number?: string;
  tin?: string;
  billing_address?: string;
  total_amount?: number;
  payment_type?: string;
  status?: string;
  sc_pwd_discount?: boolean;
  vat_exempted?: boolean;
  special_discount?: number;
  initiator_id: string | { _id: string; first_name: string; last_name: string };
  company_id: string | { _id: string; company_name: string };
  referrer_id?: string | { _id: string; referrer_name: string };
  referring_doctor_id?: string;
  approver_id?: string | { _id: string; first_name: string; last_name: string };
  order_items?: OrderItem[];
  created_at?: string;
  payments?: Payment[]
};

export type Payment = {
  _id?: string;
  order_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method: string;
  bank_name: string;
  trans_ref_no: string;
  collection_receipt_no: string;
  created_at?: string;
};

export type CancelItem = {
  _id: string;
  product_id: string;
  checked: boolean;
  label: string;
  quantity: number;
  maxQty: number;
}
