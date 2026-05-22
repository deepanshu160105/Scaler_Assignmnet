import api from './axios';

export const orderApi = {
  placeOrder:  (data)        => api.post('/orders', data),
  getOrders:   (params)      => api.get('/orders', { params }),
  getOrder:    (orderNumber) => api.get(`/orders/${orderNumber}`),
  cancelOrder: (orderNumber) => api.put(`/orders/${orderNumber}/cancel`),
};
