import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return; }
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setCart(res.data.data.cart);
    } catch { setCart(null); }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId, qty = 1) => {
    const res = await cartApi.addItem(productId, qty);
    setCart(res.data.data.cart);
    return res.data.data.cart;
  }, []);

  const updateItem = useCallback(async (itemId, qty) => {
    const res = await cartApi.updateItem(itemId, qty);
    setCart(res.data.data.cart);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const res = await cartApi.removeItem(itemId);
    setCart(res.data.data.cart);
  }, []);

  // Server-side cart clear (DELETE /api/cart) — used after order placement
  const clearCart = useCallback(async () => {
    try {
      const res = await cartApi.clearCart();
      setCart(res.data.data.cart);
    } catch {
      // Fallback: just zero out locally
      setCart(prev => prev ? { ...prev, items: [], itemCount: 0, subtotal: 0 } : null);
    }
  }, []);

  // Client-side only (no API call) — use when cart is already cleared by the backend (e.g. after order)
  const clearCartLocally = useCallback(() => {
    setCart(prev => prev ? { ...prev, items: [], itemCount: 0, subtotal: 0 } : null);
  }, []);

  const itemCount = cart?.itemCount ?? 0;

  return (
    <CartContext.Provider value={{
      cart, loading, itemCount,
      fetchCart, addToCart, updateItem, removeItem,
      clearCart, clearCartLocally,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
