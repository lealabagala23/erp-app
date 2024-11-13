import React, { createContext, useState, useEffect } from 'react';

import { Company, IAuthContext, UserInfo } from './types';
import { useMutation } from '@tanstack/react-query';
import { fetchCompanies, fetchUserInfo } from './apis';

const DEFAULT_CONTEXT = {
  userInfo: null,
  fetchingUserInfo: false,
  companies: [],
  fetchingCompanies: false,
};

const AuthContext = createContext<IAuthContext>(DEFAULT_CONTEXT);

interface IProps {
  children: React.ReactChild;
}

export const AuthProvider = ({ children }: IProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const { mutateAsync: mutateGetUserInfo, isLoading: fetchingUserInfo } =
    useMutation({
      mutationFn: fetchUserInfo,
      onSuccess: (data) => {
        setUserInfo(data);
      },
    });

  const { mutateAsync: mutateGetCompanies, isLoading: fetchingCompanies } =
    useMutation({
      mutationFn: fetchCompanies,
      onSuccess: (data) => {
        setCompanies(data);
      },
    });

  useEffect(() => {
    mutateGetUserInfo();
    mutateGetCompanies();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userInfo, fetchingUserInfo, companies, fetchingCompanies }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
