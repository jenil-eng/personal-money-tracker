import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('pmt_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pmt_user') || 'null'));
  const [loading, setLoading] = useState(true);

  // Auto login helper
  const autoLogin = async () => {
    try {
      const response = await loginApi('admin@student.com', 'password123');
      const { token: authToken, user: userData } = response.data;
      localStorage.setItem('pmt_token', authToken);
      localStorage.setItem('pmt_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return response.data;
    } catch (err) {
      console.error('Auto login failed:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await getMeApi();
          setUser(response.data.user);
          localStorage.setItem('pmt_user', JSON.stringify(response.data.user));
        } catch (err) {
          console.error('Session expired, executing auto-login:', err);
          await autoLogin();
        }
      } else {
        // If no token exists, automatically log in as private admin
        await autoLogin();
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await loginApi(email, password);
    const { token: authToken, user: userData } = response.data;
    localStorage.setItem('pmt_token', authToken);
    localStorage.setItem('pmt_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('pmt_token');
    localStorage.removeItem('pmt_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout, autoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
