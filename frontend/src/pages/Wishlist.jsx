import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { wishlistApi } from '../api/wishlistApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/formatPrice';

export default function Wishlist() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    wishlistApi.getWishlist()
      .then(res => setItems(res.data.data?.wishlist || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      // Wishlist item: { id, productId, product: {...} }
      setItems(prev => prev.filter(w => w.product?.id !== productId && w.productId !== productId));
      showToast('Removed from Wishlist', 'info');
    } catch { showToast('Failed to remove', 'error'); }
  };

  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      showToast('Added to Cart!', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to add to cart', 'error');
    } finally { setAddingId(null); }
  };

  if (loading) return <div className="spinner-center"><Spinner size="lg" /></div>;

  return (
    <div className="container page-content">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 400, marginBottom: 20 }}>
        <FiHeart style={{ color: '#CC0C39', marginRight: 8, verticalAlign: 'middle' }} />
        Your Wish List ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❤️</div>
          <h3>Your Wish List is empty</h3>
          <p>Add items you love to your wish list. Review them anytime and easily move them to the cart.</p>
          <Link to="/products"><button className="btn btn-primary btn-lg">Continue Shopping</button></Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map(item => {
            // Wishlist item shape from backend: { id, productId, product: { id, slug, name, images, price, rating, reviewCount, stock, ... } }
            const product = item.product;
            if (!product) return null;
            const imgSrc = product.images?.[0] || 'https://placehold.co/200x200?text=No+Image';
            const inStock = product.stock > 0;

            return (
              <div key={item.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <button
                  onClick={() => handleRemove(product.id)}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'white', border: 'none', borderRadius: '50%',
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: 'var(--shadow-md)', color: '#CC0C39', zIndex: 1,
                  }}
                  title="Remove from Wishlist"
                >
                  <FiHeart size={16} fill="#CC0C39" />
                </button>

                <Link to={`/products/${product.slug}`}>
                  <div style={{ background: 'var(--bg-light)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1' }}>
                    <img src={imgSrc} alt={product.name} style={{ maxHeight: 160, objectFit: 'contain' }} />
                  </div>
                </Link>

                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to={`/products/${product.slug}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-link)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </Link>

                  {/* Backend field: rating (not averageRating) */}
                  {product.rating > 0 && (
                    <StarRating rating={product.rating} count={product.reviewCount} size={12} />
                  )}

                  <div style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>
                    {formatPrice(product.price)}
                  </div>

                  {!inStock && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--btn-danger)', fontWeight: 600 }}>
                      Out of Stock
                    </p>
                  )}

                  <button
                    className="btn btn-primary btn-sm btn-full"
                    style={{ marginTop: 'auto' }}
                    onClick={() => handleAddToCart(product)}
                    disabled={!inStock || addingId === product.id}
                    id={`wishlist-add-cart-${product.id}`}
                  >
                    <FiShoppingCart size={13} />
                    {addingId === product.id ? 'Adding…' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
