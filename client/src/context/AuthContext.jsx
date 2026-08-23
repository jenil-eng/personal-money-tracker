import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('pmt_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pmt_user') || 'null'));
  const [loading, setLoading] = useState(() => {
    // If token and user exist in cache, render UI immediately without blocking
    return !localStorage.getItem('pmt_token') || !localStorage.getItem('pmt_user');
  });
  const [privacyMode, setPrivacyMode] = useState(() => {
    return localStorage.getItem('pmt_privacy') === 'true';
  });

  const togglePrivacyMode = () => {
    setPrivacyMode(prev => {
      const next = !prev;
      localStorage.setItem('pmt_privacy', String(next));
      return next;
    });
  };

  const formatAmount = (amount, currencySymbol = '₹') => {
    if (privacyMode) return `${currencySymbol}••••`;
    const num = Number(amount) || 0;
    return `${currencySymbol}${num.toLocaleString('en-IN')}`;
  };

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
          console.warn('JWT token invalid or expired. Logging out user:', err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
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
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      loading, 
      login, 
      logout, 
      autoLogin,
      privacyMode,
      togglePrivacyMode,
      formatAmount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
