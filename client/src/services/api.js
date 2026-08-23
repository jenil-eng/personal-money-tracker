import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://personal-money-tracker-backend.onrender.com/api' : '/api');

const API = axios.create({
  baseURL
});

// Early pre-warm ping to wake Render backend as early as possible
if (typeof window !== 'undefined') {
  axios.get(`${baseURL}/health`).catch(() => {});
}

let coldStartToastId = null;

// Attach Authorization Bearer token & cold start detector to all outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Detect if request takes > 2.5 seconds (Render free tier cold start)
  config.coldStartTimer = setTimeout(() => {
    if (!coldStartToastId) {
      coldStartToastId = toast.loading('Server is waking up (Render free tier cold start)...', {
        id: 'render-cold-start-toast'
      });
    }
  }, 2500);

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response error handling & timer clearing interceptor
API.interceptors.response.use(
  (response) => {
    if (response.config?.coldStartTimer) {
      clearTimeout(response.config.coldStartTimer);
    }
    if (coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }
    return response;
  },
  (error) => {
    if (error.config?.coldStartTimer) {
      clearTimeout(error.config.coldStartTimer);
    }
    if (coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }
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
