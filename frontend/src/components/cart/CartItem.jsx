import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useState } from 'react';

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { id, product, quantity, priceAtPurchase } = item;
  const imgSrc = product?.images?.[0] || 'https://placehold.co/120x120?text=No+Image';

  const handleQtyChange = async (newQty) => {
    if (newQty < 1) return;
    setLoading(true);
    try { await updateItem(id, newQty); }
    catch { showToast('Failed to update quantity', 'error'); }
    finally { setLoading(false); }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeItem(id);
      showToast('Item removed from cart', 'info');
    } catch { showToast('Failed to remove item', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="cart-item" style={{ opacity: loading ? 0.6 : 1 }}>
      <div className="cart-item-img">
        <Link to={`/products/${product?.slug}`}>
          <img src={imgSrc} alt={product?.name} />
        </Link>
      </div>
      <div className="cart-item-body">
        <Link to={`/products/${product?.slug}`} className="cart-item-title">
          {product?.name}
        </Link>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-link)', marginBottom: 4 }}>In Stock</p>
        <div className="cart-item-price">
          {formatPrice((priceAtPurchase ?? product?.price) * quantity)}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 8 }}>
          {formatPrice(priceAtPurchase ?? product?.price)} each
        </div>
        <div className="cart-item-actions">
          <div className="qty-stepper">
            <button onClick={() => handleQtyChange(quantity - 1)} disabled={loading || quantity <= 1}>−</button>
            <span>{quantity}</span>
            <button onClick={() => handleQtyChange(quantity + 1)} disabled={loading || quantity >= 10}>+</button>
          </div>
          <span style={{ color: 'var(--border-dark)' }}>|</span>
          <button className="btn btn-link btn-sm" onClick={handleRemove} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiTrash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
