import axiosConfig from '../../../utils/axiosConfig';

const PRODUCTS_API = '/api/products';

export const fetchProducts = async () => {
  const response = await axiosConfig.get(`${PRODUCTS_API}`);
  return response?.data;
};
