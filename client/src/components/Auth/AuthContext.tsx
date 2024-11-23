import React, { createContext, useState, useEffect } from 'react';

import { Company, IAuthContext, Supplier, UserInfo } from './types';
import { useMutation } from '@tanstack/react-query';
import { fetchCompanies, fetchSuppliers, fetchUserInfo } from './apis';

const DEFAULT_CONTEXT = {
  userInfo: null,
  fetchingUserInfo: false,
  companies: [],
  fetchingCompanies: false,
  activeCompany: null,
  setActiveCompany: () => {},
  suppliers: [],
  fetchingSuppliers: false,
};

const AuthContext = createContext<IAuthContext>(DEFAULT_CONTEXT);

interface IProps {
  children: React.ReactChild;
}

export const AuthProvider = ({ children }: IProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

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

  const { mutateAsync: mutateGetSuppliers, isLoading: fetchingSuppliers } =
    useMutation({
      mutationFn: fetchSuppliers,
      onSuccess: (data) => {
        setSuppliers(data);
      },
    });

  useEffect(() => {
    mutateGetUserInfo();
    mutateGetCompanies();
    mutateGetSuppliers();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      console.log('here', companies[0]);
      setActiveCompany(companies[0]);
    }
  }, [companies]);

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        fetchingUserInfo,
        companies,
        fetchingCompanies,
        activeCompany,
        setActiveCompany,
        suppliers,
        fetchingSuppliers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
