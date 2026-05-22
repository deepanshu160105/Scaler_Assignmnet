import api from './axios';

export const cartApi = {
  getCart:    ()               => api.get('/cart'),
  addItem:    (productId, qty) => api.post('/cart/items', { productId, quantity: qty }),
  updateItem: (itemId, qty)    => api.put(`/cart/items/${itemId}`, { quantity: qty }),
  removeItem: (itemId)         => api.delete(`/cart/items/${itemId}`),
  clearCart:  ()               => api.delete('/cart'),
};
