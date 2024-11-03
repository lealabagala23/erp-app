import { jwtDecode } from 'jwt-decode';

export const isTokenValid = (token) => {
  if (!token) return false;

  const decodedToken = jwtDecode(token);
  const currentTime = Date.now() / 1000; // Get current time in seconds

  // Check if the token is expired
  return decodedToken.exp > currentTime;
};
