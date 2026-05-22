import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';

const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    title: 'Electronics Sale',
    sub: 'Up to 40% off on top brands',
    cta: 'Shop Electronics',
    category: 'electronics',
    emoji: '📱',
  },
  {
    bg: 'linear-gradient(135deg, #0d4f3c 0%, #1a7a59 50%, #2ecc71 100%)',
    title: 'Clothing & Fashion',
    sub: 'Trendy styles at unbeatable prices',
    cta: 'Shop Clothing',
    category: 'clothing',
    emoji: '👔',
  },
  {
    bg: 'linear-gradient(135deg, #4a1942 0%, #7b2d8b 50%, #c65bcf 100%)',
    title: 'Home & Kitchen',
    sub: 'Transform your space today',
    cta: 'Shop Home',
    category: 'home-kitchen',
    emoji: '🏠',
  },
  {
    bg: 'linear-gradient(135deg, #7f3000 0%, #c45500 50%, #ff9900 100%)',
    title: 'Great Indian Sale',
    sub: 'Millions of deals. Massive savings.',
    cta: 'See All Deals',
    category: '',
    emoji: '🎉',
  },
];

// Emoji fallback for category icons
const CATEGORY_EMOJIS = {
  electronics: '💻', food: '🍔', clothing: '👔', 'home-kitchen': '🏠',
  sports: '⚽', 'toys-games': '🎮',
};

const CATEGORY_COLORS = [
  '#E8F4FD', '#FDF5E8', '#EDFDF5', '#F3EAFD',
  '#FDF0EA', '#EAFDF0', '#FDE8F3', '#EDFDE8',
];

// Section configs for category-wise product rows
const SECTIONS = [
  { slug: 'electronics',   title: '⚡ Top Deals in Electronics',    emoji: '💻', color: '#232f3e' },
  { slug: 'food',          title: '🍔 Food & Beverages',            emoji: '🍔', color: '#3b2e25' },
  { slug: 'clothing',      title: '👔 Clothing & Fashion',          emoji: '👔', color: '#0f1111' },
  { slug: 'home-kitchen',  title: '🏠 Home & Kitchen Essentials',   emoji: '🏠', color: '#1a3a2a' },
  { slug: 'sports',        title: '⚽ Sports & Outdoors',           emoji: '⚽', color: '#1a2e3a' },
  { slug: 'toys-games',    title: '🎮 Toys, Games & Décor',         emoji: '🎮', color: '#2e3a1a' },
];

/* Horizontal scroll row with arrow buttons */
function ScrollRow({ children }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="scroll-arrow scroll-arrow-left"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <FiChevronLeft size={22} />
      </button>
      <div className="product-row-scroll" ref={scrollRef}>
        {children}
      </div>
      <button
        className="scroll-arrow scroll-arrow-right"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <FiChevronRight size={22} />
      </button>
    </div>
  );
}

/* Reusable section component for a category row */
function CategorySection({ slug, title, color }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    productApi.getProducts({ category: slug, limit: 20, sort: 'rating' })
      .then(res => setProducts(res.data.data?.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="product-row" id={`section-${slug}`}>
      <div className="product-row-header">
        <h2 className="section-heading" style={{ marginBottom: 0 }}>{title}</h2>
        <Link to={`/products?category=${slug}`} style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
          See all →
        </Link>
      </div>
      {loading ? (
        <div className="spinner-center" style={{ padding: 32 }}><Spinner /></div>
      ) : (
        <ScrollRow>
          {products.map(p => (
            <div key={p.id} className="scroll-card">
              <ProductCard product={p} />
            </div>
          ))}
        </ScrollRow>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [slide, setSlide]         = useState(0);
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(timer);
  }, []);

  // Load products (newest 20)
  useEffect(() => {
    productApi.getProducts({ limit: 20, sort: 'newest' })
      .then(res => setProducts(res.data.data?.products || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  // Load real categories from API
  useEffect(() => {
    categoryApi.getCategories()
      .then(res => setCategories(res.data.data?.categories || []))
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  const prev = () => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => setSlide(s => (s + 1) % HERO_SLIDES.length);
  const current = HERO_SLIDES[slide];

  // Show top 8 categories
  const displayedCategories = categories.slice(0, 8);

  return (
    <div>
      {/* ── Hero Carousel ─────────────────────────────────── */}
      <div className="hero-carousel">
        <div
          style={{
            background: current.bg,
            minHeight: 360,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '48px 24px',
            transition: 'background 0.6s ease',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>{current.emoji}</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)', marginBottom: 12 }}>
            {current.title}
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)', marginBottom: 28 }}>
            {current.sub}
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate(current.category ? `/products?category=${current.category}` : '/products')}
            style={{ fontSize: 16, padding: '12px 32px' }}
          >
            {current.cta}
          </button>
        </div>
        <div className="hero-gradient" />
        <button className="hero-nav-btn hero-nav-prev" onClick={prev}><FiChevronLeft size={22} /></button>
        <button className="hero-nav-btn hero-nav-next" onClick={next}><FiChevronRight size={22} /></button>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      </div>

      <div className="container">
        {/* ── Category Cards (from API) ──────────────────── */}
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="section-heading" style={{ marginBottom: 0 }}>Shop by Category</h2>
            <Link to="/products" style={{ fontSize: 'var(--text-sm)' }}>See all »</Link>
          </div>

          {loadingCats ? (
            <div className="spinner-center" style={{ padding: 24 }}><Spinner /></div>
          ) : displayedCategories.length > 0 ? (
            <ScrollRow>
              <div className="home-categories">
                {displayedCategories.map((cat, idx) => {
                  const emoji = CATEGORY_EMOJIS[cat.slug] || CATEGORY_EMOJIS[cat.name?.toLowerCase()] || '🛍️';
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div
                      key={cat.id}
                      className="category-card"
                      onClick={() => navigate(`/products?category=${cat.slug}`)}
                    >
                      <h3>{cat.name}</h3>
                      <div
                        className="category-card-img"
                        style={{ background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}
                      >
                        <span>{emoji}</span>
                      </div>
                      <span className="category-card-link">
                        {cat._count?.products ?? ''} {cat._count?.products ? 'products' : ''} · Shop now »
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollRow>
          ) : (
            // Fallback if no categories in DB yet
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>
              <p>No categories found. Add products to see categories here.</p>
              <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: 12 }}>
                Browse All Products
              </button>
            </div>
          )}
        </div>

        {/* ── Today's Deals (offset slice) ────── */}
        {products.length > 6 && (
          <div className="product-row">
            <div className="product-row-header">
              <h2 className="section-heading" style={{ marginBottom: 0 }}>💰 Today's Deals</h2>
              <Link to="/products?sort=price_asc" style={{ fontSize: 'var(--text-sm)' }}>See all deals »</Link>
            </div>
            <ScrollRow>
              {products.slice(5, 20).map(p => (
                <div key={p.id} className="scroll-card">
                  <ProductCard product={p} />
                </div>
              ))}
            </ScrollRow>
          </div>
        )}

        {/* ── Category-wise Sections ───────── */}
        {SECTIONS.map(sec => (
          <CategorySection
            key={sec.slug}
            slug={sec.slug}
            title={sec.title}
            color={sec.color}
          />
        ))}
      </div>
    </div>
  );
}
