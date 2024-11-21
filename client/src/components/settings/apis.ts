import axiosConfig from '../../utils/axiosConfig';

const AUTH_API = '/api/auth';

export const changePassword = async ({
  oldPassword,
  newPassword,
}: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await axiosConfig.post(`${AUTH_API}/change-password`, {
    oldPassword,
    newPassword,
  });

  return response?.data;
};
