import axiosConfig from '../../../utils/axiosConfig';
import { Product } from './types';
import pick from 'lodash/pick';

const PRODUCTS_API = '/api/products';

const generatePayload = (product: Product) => {
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

  return {
    ...payload,
    barcode: barcode === '' ? undefined : barcode,
  }
}

export const fetchProducts = async () => {
  const response = await axiosConfig.get(`${PRODUCTS_API}`);
  return response?.data;
};

export const createProduct = async (product: Product) => {
  const payload = generatePayload(product)
  const response = await axiosConfig.post(`${PRODUCTS_API}`, {
    ...payload,
  });

  return response?.data;
};

export const updateProduct = async (product: Product) => {
  const payload = generatePayload(product)
  const response = await axiosConfig.put(`${PRODUCTS_API}/${product._id}`, {
    ...payload,
  });

  return response?.data;
};

export const deleteProduct = async (product: Product) => {
  const response = await axiosConfig.delete(`${PRODUCTS_API}/${product._id}`);

  return response?.data;
};
