import { Customer } from '../accounts/types';
import { Inventory, Product } from '../inventory/types';

export type OrderItem = {
  order_id: string;
  product_id: string | Product;
  inventory_id: string | Inventory;
  quantity: number;
  cancelled_quantity?: number;
  unit_price: number;
  created_at?: string;
  _id?: string;
};

export type TableItem = {
  item_number: number;
  product_id: string | null;
  inventory_id: string | null;
  quantity: number;
  cancelled_quantity?: number;
  unit_price: number;
  _id?: string;
};

export type Order = {
  _id?: string;
  customer_id?: string | Customer;
  invoice_number?: string;
  tin?: string;
  billing_address?: string;
  payment_type?: string;
  status?: string;
  discount_card?: string;
  discount_card_number?: string;
  sc_pwd_discount?: boolean;
  vat_exempted?: boolean;
  special_discount?: number;
  initiator_id: string | { _id: string; first_name: string; last_name: string };
  cancel_initiator_id?: string | { _id: string; first_name: string; last_name: string };
  company_id: string | { _id: string; company_name: string };
  referrer_id?: string | { _id: string; referrer_name: string };
  referring_doctor_id?: string;
  approver_id?: string | { _id: string; first_name: string; last_name: string };
  order_items?: OrderItem[];
  created_at?: string;
  payments?: Payment[];
  sub_total?: number;
  vat_exempt_amount?: number;
  sc_pwd_disc_amount?: number;
  net_total?: number;
};

export type CompanyBankDetails = {
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  customer_name: string;
  min_created_at: string;
  orders: Order[];
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
  unit_price: number;
  maxQty: number;
};
