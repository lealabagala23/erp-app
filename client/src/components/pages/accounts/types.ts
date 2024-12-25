export type Customer = {
  _id?: string;
  customer_name: string;
  customer_type: string;
  contact_info: string;
  tin?: string;
  address?: string;
  created_at?: string;
  // eslint-disable-next-line
  customer_details?: any;
};

export type Patient = {
  customer_id: string | { _id: string; customer_name: string };
  date_of_birth: string;
  discount_card: string;
  discount_card_number: string;
  referring_doctor_id?: string | { _id: string; customer_name: string };
  status: string;
  created_at?: string;
};

export type Doctor = {
  _id?: string;
  customer_id: string | { _id: string; customer_name: string };
  specialization: string;
  clinic_address: string;
  license_number: string;
  created_at?: string;
};

export type Agency = {
  customer_id: string | { _id: string; customer_name: string };
  agency_address: string;
  industry_type: string;
  contact_person_name: string;
  created_at?: string;
};

export type Referrer = {
  _id?: string;
  referrer_name: string;
  doctor_id?: string | Doctor;
  contact_info: string;
  created_at?: string;
};
