import React, { createContext, useState, useEffect } from 'react';

import { IAuthContext, UserInfo } from './types';
import axios from 'axios';

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
  const [fetchingUserInfo, setFetchingUserInfo] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        setUserInfo(response?.data);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo, fetchingUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
