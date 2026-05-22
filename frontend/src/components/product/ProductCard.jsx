import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import StarRating from '../ui/StarRating';
import { formatPrice } from '../../utils/formatPrice';

export default function ProductCard({ product, onWishlistToggle, isWishlisted = false }) {
  const {
    slug, name, price, images,
    // Backend returns `rating` and `reviewCount` on the product model
    rating, reviewCount,
    stock,
  } = product;

  const imgSrc = images?.[0] || 'https://placehold.co/300x300?text=No+Image';
  const isOutOfStock = stock === 0;

  return (
    <div className="product-card">
      <Link to={`/products/${slug}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="product-card-image">
          <img src={imgSrc} alt={name} loading="lazy" />
        </div>
        <div className="product-card-body">
          <p className="product-card-title">{name}</p>

          {rating > 0 && (
            <div className="product-card-stars">
              <StarRating rating={rating} count={reviewCount} size={13} />
            </div>
          )}

          <div className="product-card-price">
            <div className="price-main">
              <span className="price-sym">₹</span>
              {Math.round(price).toLocaleString('en-IN')}
            </div>
            {isOutOfStock
              ? <p className="product-card-stock-out">Out of stock</p>
              : <p className="price-free-delivery">
                  {price >= 500 ? 'FREE Delivery' : '+ ₹40 delivery'}
                </p>
            }
          </div>
        </div>
      </Link>

      {onWishlistToggle && (
        <button
          onClick={(e) => { e.preventDefault(); onWishlistToggle(product); }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'white', border: 'none', borderRadius: '50%',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: 'var(--shadow-md)',
            color: isWishlisted ? '#CC0C39' : 'var(--text-secondary)',
          }}
        >
          <FiHeart size={16} fill={isWishlisted ? '#CC0C39' : 'none'} />
        </button>
      )}
    </div>
  );
}
