import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiZap, FiCamera, FiX } from 'react-icons/fi';
import { productApi } from '../api/productApi';
import { wishlistApi } from '../api/wishlistApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/formatPrice';

/* ── Interactive Star Picker ─────────────────────── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-picker-btn ${star <= (hover || value) ? 'filled' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      <span className="star-picker-label">
        {value === 0
          ? 'Select a rating'
          : value === 1
          ? 'Poor'
          : value === 2
          ? 'Fair'
          : value === 3
          ? 'Good'
          : value === 4
          ? 'Very Good'
          : 'Excellent'}
      </span>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct]       = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [qty, setQty]               = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview]         = useState({ rating: 0, title: '', comment: '', images: [] });
  const [submitting, setSubmitting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    productApi.getProduct(slug)
      .then(res => {
        setProduct(res.data.data?.product);
        setActiveImg(0);
        const p = res.data.data?.product;
        if (p?.reviews) setReviews(p.reviews);
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product?.id) return;
    productApi.getReviews(product.id)
      .then(res => setReviews(res.data.data?.reviews || []))
      .catch(() => {});

    if (isAuthenticated) {
      wishlistApi.getWishlist()
        .then(res => {
          const ids = new Set(
            (res.data.data?.wishlist || []).map(w => w.product?.id || w.productId)
          );
          setIsWishlisted(ids.has(product.id));
        }).catch(() => {});
    }
  }, [product?.id, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingCart(true);
    try {
      await addToCart(product.id, qty);
      showToast('Added to Cart!', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not add to cart', 'error');
    } finally { setAddingCart(false); }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingCart(true);
    try {
      await addToCart(product.id, qty);
      navigate('/checkout');
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not add to cart', 'error');
      setAddingCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { showToast('Please login to save items', 'info'); return; }
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(product.id);
        setIsWishlisted(false);
        showToast('Removed from Wishlist', 'info');
      } else {
        await wishlistApi.addToWishlist(product.id);
        setIsWishlisted(true);
        showToast('Added to Wishlist ♥', 'success');
      }
    } catch { showToast('Failed to update wishlist', 'error'); }
  };

  /* ── Photo Upload Handling ──────────────────────── */
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = 5 - review.images.length;
    if (remaining <= 0) {
      showToast('Maximum 5 photos per review', 'info');
      return;
    }

    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast(`"${file.name}" exceeds 5MB limit`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setReview((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx) => {
    setReview((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  /* ── Review Submit ─────────────────────────────── */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (review.rating === 0) {
      showToast('Please select a star rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await productApi.addReview(product.id, {
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
      });
      showToast('Review submitted!', 'success');
      setShowReviewForm(false);
      setReview({ rating: 0, title: '', comment: '', images: [] });
      const res = await productApi.getReviews(product.id);
      setReviews(res.data.data?.reviews || []);
      // Refresh product to get updated rating
      productApi.getProduct(slug)
        .then(r => setProduct(r.data.data?.product));
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to submit review', 'error');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="spinner-center"><Spinner size="lg" /></div>;
  if (!product) return null;

  const images = product.images?.length ? product.images : ['https://placehold.co/400x400?text=No+Image'];
  const inStock = product.stock > 0;
  const deliveryFree = product.price >= 500;

  const avgRating = product.rating || 0;
  const totalReviews = product.reviewCount || 0;

  return (
    <div className="container page-content">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> <span>›</span>
        <Link to="/products">Products</Link> <span>›</span>
        {product.category && (
          <>
            <Link to={`/products?category=${product.category?.slug || ''}`}>
              {product.category?.name || product.category}
            </Link>{' '}
            <span>›</span>
          </>
        )}
        <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
      </nav>

      <div className="product-detail">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img src={images[activeImg]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="product-gallery-thumbs">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`product-thumb ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating-row">
            {avgRating > 0 ? (
              <>
                <StarRating rating={avgRating} count={totalReviews} size={16} />
                <span style={{ color: 'var(--border-dark)' }}>|</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-link)', cursor: 'pointer' }}>
                  {totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No ratings yet — be the first to review!
              </span>
            )}
          </div>

          <div className="divider" />

          <div className="product-price-block">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                M.R.P.: <s>{formatPrice(product.compareAtPrice)}</s>
              </p>
            )}
            <p className="product-price-main">
              <span className="product-price-sym">₹</span>
              {Math.round(product.price).toLocaleString('en-IN')}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p style={{ fontSize: 'var(--text-sm)', color: '#CC0C39', fontWeight: 600 }}>
                Save {formatPrice(product.compareAtPrice - product.price)}{' '}
                ({Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off)
              </p>
            )}
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-link)', marginTop: 4 }}>
              {deliveryFree ? '✓ FREE Delivery' : 'Delivery: ₹40'}
            </p>
          </div>

          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          {product.features?.length > 0 && (
            <ul className="product-features">
              {product.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </div>

        {/* Buy Box */}
        <div className="product-buy-box">
          <div className="buy-box-price">
            <span style={{ fontSize: 14, verticalAlign: 'super' }}>₹</span>
            {Math.round(product.price).toLocaleString('en-IN')}
          </div>

          <div className="buy-box-delivery">
            {deliveryFree
              ? <><strong style={{ color: '#007600' }}>FREE</strong> delivery</>
              : <>Delivery: <strong>₹40</strong></>
            }
            <br />
            <span style={{ color: 'var(--text-link)' }}>Order within 5 hrs</span>
          </div>

          <div className={`buy-box-stock ${!inStock ? 'out-of-stock' : ''}`}>
            {inStock ? `In Stock (${product.stock} left)` : 'Out of Stock'}
          </div>

          {inStock && (
            <div className="buy-box-qty">
              <label style={{ fontSize: 'var(--text-sm)', marginRight: 8 }}>Qty:</label>
              <select value={qty} onChange={e => setQty(Number(e.target.value))}>
                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}

          <div className="buy-box-actions">
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleAddToCart}
              disabled={!inStock || addingCart}
              id="product-add-to-cart"
            >
              <FiShoppingCart /> {addingCart ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-secondary btn-full btn-lg"
              onClick={handleBuyNow}
              disabled={!inStock || addingCart}
              id="product-buy-now"
            >
              <FiZap /> Buy Now
            </button>
            <button
              className="btn btn-outline btn-full"
              onClick={handleWishlist}
              id="product-wishlist-btn"
              style={{ color: isWishlisted ? '#CC0C39' : undefined }}
            >
              <FiHeart fill={isWishlisted ? '#CC0C39' : 'none'} />
              {isWishlisted ? 'Saved' : 'Add to Wish List'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ─────────────────────────── */}
      <div className="reviews-section" style={{ background: 'white', padding: 24, borderRadius: 4, marginTop: 24 }}>
        <h2 className="section-heading">Customer Reviews</h2>

        {/* Rating Summary */}
        {totalReviews > 0 ? (
          <div style={{ display: 'flex', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, fontWeight: 300, lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
              <StarRating rating={avgRating} size={18} />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                {totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => Math.round(r.rating) === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="rating-bar-row">
                    <span style={{ minWidth: 40 }}>{star} star</span>
                    <div className="rating-bar">
                      <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ minWidth: 32, textAlign: 'right' }}>{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0 24px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>☆</div>
            <p style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>No reviews yet</p>
            <p style={{ fontSize: 'var(--text-sm)' }}>Share your thoughts with other customers</p>
          </div>
        )}

        {/* Write Review Button */}
        {isAuthenticated && !showReviewForm && (
          <button className="btn btn-outline" onClick={() => setShowReviewForm(true)} id="write-review-btn">
            Write a Customer Review
          </button>
        )}

        {/* ── Review Form ─────────────────────────── */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3 style={{ marginBottom: 16, fontSize: 'var(--text-lg)' }}>Create Review</h3>

            {/* Star Rating Picker */}
            <div style={{ marginBottom: 16 }}>
              <label className="input-label">Overall rating *</label>
              <StarPicker value={review.rating} onChange={(r) => setReview(prev => ({ ...prev, rating: r }))} />
            </div>

            {/* Headline */}
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Add a headline</label>
              <input
                className="input"
                placeholder="What's most important to know?"
                value={review.title}
                onChange={e => setReview(r => ({ ...r, title: e.target.value }))}
              />
            </div>

            {/* Comment */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Written review</label>
              <textarea
                className="input"
                rows={4}
                placeholder="What did you like or dislike? What did you use this product for?"
                value={review.comment}
                onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Photo Upload */}
            <div style={{ marginBottom: 16 }}>
              <label className="input-label">Add photos (optional, up to 5)</label>
              <div className="review-photo-upload">
                {review.images.map((img, idx) => (
                  <div key={idx} className="review-photo-thumb">
                    <img src={img} alt={`Upload ${idx + 1}`} />
                    <button
                      type="button"
                      className="review-photo-remove"
                      onClick={() => removePhoto(idx)}
                      aria-label="Remove photo"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                {review.images.length < 5 && (
                  <button
                    type="button"
                    className="review-photo-add"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiCamera size={20} />
                    <span>Add photo</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting || review.rating === 0} id="submit-review-btn">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowReviewForm(false); setReview({ rating: 0, title: '', comment: '', images: [] }); }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Review Cards ────────────────────────── */}
        <div style={{ marginTop: 24 }}>
          {reviews.length === 0 && !showReviewForm ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="review-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--amazon-navy)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {r.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="review-author">{r.user?.name || 'Anonymous'}</span>
                </div>
                <StarRating rating={r.rating} size={14} />
                {r.title && <p className="review-title">{r.title}</p>}
                {r.comment && <p className="review-body">{r.comment}</p>}

                {/* Review Photos */}
                {r.images && r.images.length > 0 && (
                  <div className="review-photos">
                    {r.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Review photo ${i + 1}`}
                        className="review-photo-display"
                        onClick={() => setLightboxImg(img)}
                      />
                    ))}
                  </div>
                )}

                <p className="review-date">
                  Reviewed on{' '}
                  {new Date(r.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Image Lightbox ────────────────────────── */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}>
            <FiX size={24} />
          </button>
          <img src={lightboxImg} alt="Review photo enlarged" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
