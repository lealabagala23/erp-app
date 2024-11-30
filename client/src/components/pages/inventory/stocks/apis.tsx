import pick from 'lodash/pick';
import axiosConfig from '../../../../utils/axiosConfig';
import { Inventory } from '../types';

const INVENTORY_API = '/api/inventory';

export const generateInventoryPayload = (inventory: Inventory) => {
  const {
    stock_arrival_date,
    expiry_date,
    quantity_on_hand,
    quantity_on_order,
    ...payload
  } = pick(inventory, [
    'inventory_id',
    'stock_arrival_date',
    'quantity_on_hand',
    'quantity_on_order',
    'expiry_date',
    'status',
    'company_id',
    'supplier_id',
    'product_id',
  ]);

  return {
    ...payload,
    stock_arrival_date: new Date(stock_arrival_date || '').toLocaleDateString(
      'en-US',
    ),
    expiry_date: new Date(expiry_date || '').toLocaleDateString('en-US'),
    quantity_on_hand: quantity_on_hand || quantity_on_order,
    quantity_on_order,
  };
};

export const fetchInventory = async ({
  company_id,
}: {
  company_id: string;
}) => {
  const response = await axiosConfig.get(
    `${INVENTORY_API}?company_id=${company_id}`,
  );
  return response?.data;
};

export const createInventory = async (inventory: Inventory) => {
  const payload = generateInventoryPayload(inventory);
  const response = await axiosConfig.post(`${INVENTORY_API}`, {
    ...payload,
  });

  return response?.data;
};

export const updateInventory = async (inventory: Inventory) => {
  const payload = generateInventoryPayload(inventory);
  const response = await axiosConfig.put(`${INVENTORY_API}/${inventory._id}`, {
    ...payload,
  });

  return response?.data;
};

export const deleteInventory = async (inventory: Inventory) => {
  const response = await axiosConfig.delete(
    `${INVENTORY_API}/${inventory._id}`,
  );

  return response?.data;
};
