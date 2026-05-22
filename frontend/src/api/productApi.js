import api from './axios';

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct:  (slug)   => api.get(`/products/${slug}`),
  getReviews:  (id, params) => api.get(`/products/${id}/reviews`, { params }),
  addReview:   (id, data)   => api.post(`/products/${id}/reviews`, data),
};
