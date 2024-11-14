export type Product = {
  _id: string;
  barcode: string;
  product_name: string;
  product_description: string;
  product_unit: string;
  generic_name: string | null;
  purchase_price: number;
  patient_price: number;
  doctor_price: number;
  agency_price: number;
  created_at: string;
};
