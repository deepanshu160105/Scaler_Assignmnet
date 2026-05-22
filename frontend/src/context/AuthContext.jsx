import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => storage.getUser());
  const [token, setToken]     = useState(() => storage.getToken());
  const [loading, setLoading] = useState(!!storage.getToken());

  // On mount: if there's a stored token, verify it's still valid
  useEffect(() => {
    if (!storage.getToken()) { setLoading(false); return; }
    authApi.getMe()
      .then(res => { setUser(res.data.data.user); storage.setUser(res.data.data.user); })
      .catch(() => { storage.clear(); setUser(null); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, tokenValue) => {
    storage.setToken(tokenValue);
    storage.setUser(userData);
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    storage.setUser(userData);
    setUser(userData);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
