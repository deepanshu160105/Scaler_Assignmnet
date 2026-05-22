import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { useAuth } from '../../context/AuthContext';

export default function CartSummary({ cart }) {
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();

  const subtotal  = cart?.subtotal ?? 0;
  const shipping  = subtotal >= 500 ? 0 : 40;
  const tax       = Math.round(subtotal * 0.18 * 100) / 100;
  const total     = subtotal + shipping + tax;

  return (
    <div className="cart-summary">
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-link)', marginBottom: 8 }}>
        ✓ Your order qualifies for FREE delivery{subtotal < 500 ? ' on orders over ₹500' : '!'}
      </p>

      <div className="cart-summary-row">
        <span>Subtotal ({cart?.itemCount ?? 0} items):</span>
        <span><strong>{formatPrice(subtotal)}</strong></span>
      </div>
      <div className="cart-summary-row">
        <span>Shipping:</span>
        <span>{shipping === 0 ? <span style={{ color: '#007600' }}>FREE</span> : formatPrice(shipping)}</span>
      </div>
      <div className="cart-summary-row">
        <span>Tax (18% GST):</span>
        <span>{formatPrice(tax)}</span>
      </div>
      <div className="cart-summary-row total">
        <span>Order Total:</span>
        <span>{formatPrice(total)}</span>
      </div>

      <button
        className="btn btn-primary btn-full btn-lg"
        style={{ marginTop: 16 }}
        onClick={() => navigate(isAuthenticated ? '/checkout' : '/login?redirect=/checkout')}
        id="cart-checkout-btn"
      >
        Proceed to Buy
      </button>
    </div>
  );
}
