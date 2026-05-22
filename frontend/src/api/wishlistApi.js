import api from './axios';

export const wishlistApi = {
  getWishlist:    ()          => api.get('/wishlist'),
  addToWishlist:  (productId) => api.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};
