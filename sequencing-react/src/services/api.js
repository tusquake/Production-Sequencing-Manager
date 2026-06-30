import axios from 'axios';

const isLocal = window.location.hostname === 'localhost';
const baseURL = isLocal 
  ? 'http://localhost:8000/order-sequencing' 
  : '/order-sequencing';

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  if (isLocal) {
    config.headers['user-email'] = 'tushar.seth@incture.com';
    config.headers['user-name'] = 'Tushar Seth';
  }
  return config;
});

export const apiService = {
  getOrders: (plant) => api.get(`/production-order/by-plant/${plant}`),
  runSimulation: (plant, orderIds) => api.post(`/production-order/sequence/${plant}`, orderIds || []),
  saveSequence: (plant, orderIds) => api.post(`/production-order/save-sequence/${plant}`, orderIds),
  validateSequence: (plant, orderIds) => api.post(`/production-order/validate-sequence/${plant}`, orderIds),
  getRules: (plant) => api.get(`/sequencing-rule/by-plant/${plant}`),
  createRule: (payload) => api.post(`/sequencing-rule/create`, payload),
  updateRule: (payload) => api.put(`/sequencing-rule/update`, payload),
  deleteRule: (id) => api.delete(`/sequencing-rule/delete/${id}`),
  getActivityLogs: (plant) => api.get(`/activity-log/by-plant/${plant}`),
};

export default apiService;
