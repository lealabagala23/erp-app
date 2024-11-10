import React, { createContext, useState, useEffect } from 'react';

import { IAuthContext, UserInfo } from './types';
import { useMutation } from '@tanstack/react-query';
import { fetchUserInfo } from './apis';

const DEFAULT_CONTEXT = {
  userInfo: null,
  fetchingUserInfo: false,
};

const AuthContext = createContext<IAuthContext>(DEFAULT_CONTEXT);

interface IProps {
  children: React.ReactChild;
}

export const AuthProvider = ({ children }: IProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: fetchUserInfo,
    onSuccess: (data) => {
      setUserInfo(data);
    },
  });

  const getUserInfo = async () => mutateAsync();

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo, fetchingUserInfo: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
