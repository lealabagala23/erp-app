import React, { createContext, useState, useEffect } from 'react';

import { Company, IAuthContext, Supplier, UserInfo } from './types';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchCompanies,
  fetchExpiringStocks,
  fetchSuppliers,
  fetchUserInfo,
} from './apis';

const DEFAULT_CONTEXT = {
  userInfo: null,
  fetchingUserInfo: false,
  companies: [],
  fetchingCompanies: false,
  activeCompany: null,
  setActiveCompany: () => {},
  suppliers: [],
  fetchingSuppliers: false,
  expiringStocks: [],
  fetchingExpiringStocks: false,
  showExpiryWarning: false,
  hideExpiryWarning: () => {},
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
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

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

  const { data: expiringStocks = [], isLoading: fetchingExpiringStocks } =
    useQuery(
      ['fetchExpiringStocks', activeCompany?._id],
      () =>
        fetchExpiringStocks({
          company_id: activeCompany?._id as string,
        }),
      {
        enabled: !!activeCompany?._id,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    );

  useEffect(() => {
    mutateGetUserInfo();
    mutateGetCompanies();
    mutateGetSuppliers();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      setActiveCompany(companies[0]);
    }
  }, [companies]);

  useEffect(() => {
    if (!fetchingExpiringStocks && expiringStocks.length > 0) {
      setShowExpiryWarning(true);
    }
  }, [expiringStocks]);

  const hideExpiryWarning = () => setShowExpiryWarning(false);

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
        expiringStocks,
        fetchingExpiringStocks,
        showExpiryWarning,
        hideExpiryWarning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
