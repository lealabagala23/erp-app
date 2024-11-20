import axiosConfig from '../../../utils/axiosConfig';
import { generateInventoryPayload } from './stocks/apis';
import { Inventory, Product } from './types';
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
  };
};

export const fetchProducts = async () => {
  const response = await axiosConfig.get(`${PRODUCTS_API}`);
  return response?.data;
};

export const createProduct = async (product: Product) => {
  const payload = generatePayload(product);
  const response = await axiosConfig.post(`${PRODUCTS_API}`, {
    ...payload,
  });

  return response?.data;
};

export const updateProduct = async (product: Product) => {
  const payload = generatePayload(product);
  const response = await axiosConfig.put(`${PRODUCTS_API}/${product._id}`, {
    ...payload,
  });

  return response?.data;
};

export const deleteProduct = async (product: Product) => {
  const response = await axiosConfig.delete(`${PRODUCTS_API}/${product._id}`);

  return response?.data;
};

export const fetchProductInventory = async ({
  product_id,
  company_id,
}: {
  product_id: string;
  company_id: string;
}) => {
  const response = await axiosConfig.get(
    `${PRODUCTS_API}/${product_id}/inventory?company_id=${company_id}`,
  );
  return response?.data;
};


export const createProductInventory = async (inventory: Inventory) => {
  const payload = generateInventoryPayload(inventory)

  const response = await axiosConfig.post(
    `${PRODUCTS_API}/${inventory.product_id}/inventory`,
    {
      ...payload,
    },
  );
  return response?.data;
};

export const updateProductInventory = async (inventory: Inventory) => {
  const payload = generateInventoryPayload(inventory)

  const response = await axiosConfig.put(
    `${PRODUCTS_API}/${inventory.product_id}/inventory/${inventory._id}`,
    {
      ...payload,
    },
  );
  return response?.data;
};
