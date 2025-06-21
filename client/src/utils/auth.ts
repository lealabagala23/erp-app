import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import { Product } from '../components/pages/inventory/types';

export const isTokenValid = (token: string) => {
  if (!token) return false;

  const decodedToken = jwtDecode(token);
  const currentTime = Date.now() / 1000; // Get current time in seconds

  // Check if the token is expired
  return (decodedToken?.exp as number) > currentTime;
};

export const dateSortComparator = (v1: string, v2: string) => {
  const date1 = dayjs(v1);
  const date2 = dayjs(v2);
  return date2.diff(date1);
};

export const dateDiffInDays = (date: string) => {
  const date1 = dayjs();
  const date2 = dayjs(date);
  return date2.diff(date1, 'day');
};

export const convertNaNToZero = (v: number | string) => {
  const value = typeof v === 'string' ? Number(v) : v;
  if (isNaN(value)) return 0;
  return value;
};

export const formatCurrency = (v: number | string) =>
  convertNaNToZero(v || 0)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatCurrencyWithoutDecimal = (value: string | number): string => {
  if (value === "") return "";
  const [intPart, decimalPart] = `${value}`.split(".");
  const formattedInt = parseInt(intPart.replace(/,/g, ""), 10).toLocaleString("en-US");
  return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
};

export const unformatCurrency = (formatted: string): number => {
  const numeric = formatted.replace(/,/g, "");
  return parseFloat(numeric) || 0;
};

export const getUnitPrice = (products: Product[], product_id: string) => {
  // eslint-disable-next-line
  const selectedProduct = products.find(({ _id }: any) => _id === product_id);
  return selectedProduct?.unit_price ?? 0;
};

export const formatEmptyString = (v: string) =>
  v === undefined || v === '' ? '-' : v;
