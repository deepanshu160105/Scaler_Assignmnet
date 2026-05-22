import api from './axios';

export const paymentApi = {
  // Returns the Stripe publishable key from backend
  getConfig: ()           => api.get('/payments/config'),
  // Creates a PaymentIntent from the current cart total
  createIntent: ()        => api.post('/payments/create-intent'),
};
