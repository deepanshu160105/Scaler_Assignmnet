import api from './axios';

export const addressApi = {
  getAddresses:    ()      => api.get('/addresses'),
  addAddress:      (data)  => api.post('/addresses', data),
  updateAddress:   (id, data) => api.put(`/addresses/${id}`, data),
  setDefault:      (id)    => api.put(`/addresses/${id}/default`),
  deleteAddress:   (id)    => api.delete(`/addresses/${id}`),
};
