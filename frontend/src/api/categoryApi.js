import api from './axios';

export const categoryApi = {
  getCategories:      ()     => api.get('/categories'),
  getCategoryBySlug:  (slug, params) => api.get(`/categories/${slug}`, { params }),
};
