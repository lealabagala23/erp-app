import { Dispatch, SetStateAction } from "react";
import { Inventory } from "../pages/inventory/types";

export type UserInfo = {
  _id?: string;
  first_name: string;
  last_name: string;
  user_name: string;
  role: 'admin' | 'approver' | 'user'
};

export type Company = {
  _id: string;
  company_name: string;
  company_display_name: string;
  company_address: string;
  tin: string;
  contact_info: string;
  company_description: string;
  company_logo: string;
};

export type Supplier = {
  _id: string;
  supplier_name: string;
  contact_info: string;
  address: string;
};

export interface IAuthContext {
  userInfo: UserInfo | null;
  fetchingUserInfo: boolean;
  companies: Company[];
  fetchingCompanies: boolean;
  activeCompany: Company | null;
  setActiveCompany: Dispatch<SetStateAction<Company | null>>;
  suppliers: Supplier[];
  fetchingSuppliers: boolean;
  expiringStocks: Inventory[];
  fetchingExpiringStocks: boolean;
  showExpiryWarning: boolean;
  hideExpiryWarning: () => void;
}
