import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Spinner from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, loading } = useCart();
  const items = cart?.items || [];

  if (loading) return <div className="spinner-center"><Spinner size="lg" /></div>;

  return (
    <div className="container page-content">
      <div className="cart-layout">
        {/* Items */}
        <div style={{ background: 'white', padding: 'var(--space-lg)', borderRadius: 4, border: '1px solid var(--border)' }}>
          <h1 className="cart-header">
            {items.length === 0 ? 'Your Amazon Cart is empty' : 'Shopping Cart'}
          </h1>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FiShoppingCart /></div>
              <h3>Your cart is empty</h3>
              <p>Add items to your cart to see them here.</p>
              <Link to="/products">
                <button className="btn btn-primary btn-lg">Continue Shopping</button>
              </Link>
            </div>
          ) : (
            <>
              {items.length > 0 && (
                <p style={{ textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Price
                </p>
              )}
              {items.map(item => <CartItem key={item.id} item={item} />)}

              <div style={{ textAlign: 'right', marginTop: 16, fontSize: 'var(--text-lg)' }}>
                Subtotal ({cart?.itemCount} items):{' '}
                <strong>₹{Math.round(cart?.subtotal || 0).toLocaleString('en-IN')}</strong>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && <CartSummary cart={cart} />}
      </div>
    </div>
  );
}
