import api from './axios';

export const authApi = {
  sendOtp:   (email)                    => api.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp)               => api.post('/auth/verify-otp', { email, otp }),
  register:  (name, email, password)    => api.post('/auth/register', { name, email, password }),
  login:     (email, password)          => api.post('/auth/login', { email, password }),
  getMe:     ()                         => api.get('/auth/me'),
  updateMe:  (data)                     => api.put('/auth/me', data),
};
