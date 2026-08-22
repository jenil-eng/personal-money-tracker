import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://personal-money-tracker-backend.onrender.com/api' : '/api')
});

// Attach Authorization Bearer token to all outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response error handling interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pmt_token');
      localStorage.removeItem('pmt_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginApi = (email, password) => API.post('/auth/login', { email, password });
export const getMeApi = () => API.get('/auth/me');

// Transactions endpoints
export const getTransactionsApi = () => API.get('/transactions');
export const addTransactionApi = (data) => API.post('/transactions', data);
export const updateTransactionApi = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransactionApi = (id) => API.delete(`/transactions/${id}`);

// Earnings endpoints
export const getEarningsApi = () => API.get('/earnings');
export const addEarningApi = (data) => API.post('/earnings', data);
export const updateEarningApi = (id, data) => API.put(`/earnings/${id}`, data);
export const deleteEarningApi = (id) => API.delete(`/earnings/${id}`);

// Settings endpoints
export const getSettingsApi = () => API.get('/settings');
export const updateSettingsApi = (data) => API.put('/settings', data);

// Subscriptions endpoints
export const getSubscriptionsApi = () => API.get('/subscriptions');
export const addSubscriptionApi = (data) => API.post('/subscriptions', data);
export const updateSubscriptionApi = (id, data) => API.put(`/subscriptions/${id}`, data);
export const deleteSubscriptionApi = (id) => API.delete(`/subscriptions/${id}`);
export const paySubscriptionApi = (id) => API.post(`/subscriptions/${id}/pay`);

export default API;
