import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiMapPin, FiUser, FiLogOut, FiPackage, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productApi } from '../../api/productApi';
import { useDebounce } from '../../utils/useDebounce';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery]               = useState(searchParams.get('search') || '');
  const [showAccount, setShowAccount]   = useState(false);
  const [suggestions, setSuggestions]   = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const accountRef    = useRef(null);
  const searchBoxRef  = useRef(null);

  // Debounce the search query (400ms)
  const debouncedQuery = useDebounce(query, 400);

  // Fetch suggestions when the debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    productApi
      .getProducts({ search: debouncedQuery.trim(), limit: 8 })
      .then((res) => {
        if (cancelled) return;
        const results = res.data.data?.products || [];
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setHighlightIdx(-1);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccount(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    else navigate('/products');
  };

  const handleSuggestionClick = (product) => {
    setQuery(product.name);
    setShowSuggestions(false);
    navigate(`/products/${product.slug}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowAccount(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <span className="nav-logo-text">amazon<span>.in</span></span>
        </Link>

        {/* Deliver to */}
        <div className="nav-deliver">
          <span className="nav-deliver-label">Deliver to</span>
          <span className="nav-deliver-value" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FiMapPin size={12} /> India
          </span>
        </div>

        {/* Search with debounced suggestions */}
        <form className="nav-search" onSubmit={handleSearch} ref={searchBoxRef}>
          <select className="nav-search-select" defaultValue="all">
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home</option>
          </select>
          <input
            className="nav-search-input"
            type="text"
            placeholder="Search Amazon.in"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
            id="navbar-search-input"
            autoComplete="off"
          />
          <button type="submit" className="nav-search-btn" id="navbar-search-btn">
            <FiSearch />
          </button>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((product, idx) => (
                <div
                  key={product.id}
                  className={`search-suggestion-item ${idx === highlightIdx ? 'highlighted' : ''}`}
                  onMouseDown={() => handleSuggestionClick(product)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                >
                  <FiSearch size={13} style={{ flexShrink: 0, color: 'var(--text-secondary)' }} />
                  <img
                    src={product.images?.[0] || ''}
                    alt=""
                    style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4, flexShrink: 0, background: 'var(--bg-light)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="search-suggestion-name">{product.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {product.category?.name || ''} · ₹{Math.round(product.price).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
              <div
                className="search-suggestion-item search-suggestion-all"
                onMouseDown={handleSearch}
              >
                <FiSearch size={13} style={{ flexShrink: 0 }} />
                <span>See all results for "<strong>{query}</strong>"</span>
              </div>
            </div>
          )}
        </form>

        {/* Account dropdown */}
        <div style={{ position: 'relative' }} ref={accountRef}>
          <button
            className="nav-btn"
            onClick={() => isAuthenticated ? setShowAccount(s => !s) : navigate('/login')}
            id="navbar-account-btn"
          >
            <span className="nav-btn-label">
              {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0]}` : 'Hello, sign in'}
            </span>
            <span className="nav-btn-value" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <FiUser size={14} /> Account ▾
            </span>
          </button>

          {showAccount && isAuthenticated && (
            <div style={{
              position: 'absolute', top: '110%', right: 0,
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              minWidth: 200, zIndex: 100, padding: '8px 0',
            }}>
              <Link to="/account" onClick={() => setShowAccount(false)}
                className="account-sidebar-link" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiUser size={14} /> My Account
              </Link>
              <Link to="/orders" onClick={() => setShowAccount(false)}
                className="account-sidebar-link" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPackage size={14} /> Returns & Orders
              </Link>
              <Link to="/wishlist" onClick={() => setShowAccount(false)}
                className="account-sidebar-link" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiHeart size={14} /> Wishlist
              </Link>
              <button onClick={handleLogout}
                className="account-sidebar-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--btn-danger)' }}>
                <FiLogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Returns & Orders */}
        <button className="nav-btn" onClick={() => navigate('/orders')} id="navbar-orders-btn">
          <span className="nav-btn-label">Returns</span>
          <span className="nav-btn-value">& Orders</span>
        </button>

        {/* Cart */}
        <Link to="/cart" className="nav-cart" id="navbar-cart-btn">
          <FiShoppingCart className="nav-cart-icon" size={30} />
          {itemCount > 0 && <span className="nav-cart-count">{itemCount > 99 ? '99+' : itemCount}</span>}
          <span className="nav-cart-label">Cart</span>
        </Link>
      </div>
    </nav>
  );
}
