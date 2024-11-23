import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';

export const isTokenValid = (token: string) => {
  if (!token) return false;

  const decodedToken = jwtDecode(token);
  const currentTime = Date.now() / 1000; // Get current time in seconds

  // Check if the token is expired
  return decodedToken?.exp as number > currentTime;
};

export const dateSortComparator = (v1: string, v2: string) => {
  const date1 = dayjs(v1);
  const date2 = dayjs(v2);
  return date2.diff(date1);
}

export const dateDiffInDays = (date: string) => {
  const date1 = dayjs();
  const date2 = dayjs(date);
  return date2.diff(date1, 'day');
}
