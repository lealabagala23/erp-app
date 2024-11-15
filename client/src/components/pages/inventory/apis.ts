import axiosConfig from '../../../utils/axiosConfig';
import { Product } from './types';
import pick from 'lodash/pick';

const PRODUCTS_API = '/api/products';

export const fetchProducts = async () => {
  const response = await axiosConfig.get(`${PRODUCTS_API}`);
  return response?.data;
};

export const createProduct = async (product: Product) => {
  const { barcode, ...payload } = pick(product, [
    'barcode',
    'product_name',
    'product_description',
    'product_unit',
    'generic_name',
    'purchase_price',
    'patient_price',
    'doctor_price',
    'agency_price',
  ]);
  const response = await axiosConfig.post(`${PRODUCTS_API}`, {
    ...payload,
    barcode: barcode === '' ? undefined : barcode,
  });

  return response?.data;
};
