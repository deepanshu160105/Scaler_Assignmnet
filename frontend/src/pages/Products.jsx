import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { wishlistApi } from '../api/wishlistApi';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../utils/useDebounce';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts]           = useState([]);
  const [pagination, setPagination]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const [filters, setFilters] = useState({
    search:    searchParams.get('search')   || '',
    category:  searchParams.get('category') || '',
    sort:      searchParams.get('sort')     || '',
    minPrice:  searchParams.get('minPrice') || '',
    maxPrice:  searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating')|| '',
    page:      parseInt(searchParams.get('page') || '1'),
  });

  // Debounce filters so rapid changes don't fire multiple API calls
  const debouncedFilters = useDebounce(filters, 400);

  // Sync URL → filters when search/category changes externally (SubNavbar clicks)
  useEffect(() => {
    setFilters(f => ({
      ...f,
      search:   searchParams.get('search')   || '',
      category: searchParams.get('category') || '',
      page: 1,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('search'), searchParams.get('category')]);

  // Fetch products whenever debounced filters change
  useEffect(() => {
    setLoading(true);

    // Build query params — only send non-empty values
    const params = { page: debouncedFilters.page, limit: 16 };
    if (debouncedFilters.search)    params.search    = debouncedFilters.search;
    if (debouncedFilters.category)  params.category  = debouncedFilters.category;
    if (debouncedFilters.sort)      params.sort      = debouncedFilters.sort;
    if (debouncedFilters.minPrice)  params.minPrice  = debouncedFilters.minPrice;
    if (debouncedFilters.maxPrice)  params.maxPrice  = debouncedFilters.maxPrice;
    // Backend uses `minRating` query param → filters products by product.rating >= minRating
    if (debouncedFilters.minRating) params.minRating = debouncedFilters.minRating;

    productApi.getProducts(params)
      .then(res => {
        setProducts(res.data.data?.products || []);
        setPagination(res.data.data?.pagination || null);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    // Keep URL in sync
    const sp = {};
    Object.entries(params).forEach(([k, v]) => { if (v) sp[k] = String(v); });
    setSearchParams(sp, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  // Fetch wishlist IDs (product.id inside each wishlist item)
  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistApi.getWishlist()
      .then(res => {
        // Wishlist item shape: { id, userId, productId, product: { id, ... } }
        const ids = new Set(
          (res.data.data?.wishlist || []).map(w => w.product?.id || w.productId)
        );
        setWishlistedIds(ids);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleWishlistToggle = async (product) => {
    if (!isAuthenticated) { showToast('Please login to save items', 'info'); return; }
    try {
      if (wishlistedIds.has(product.id)) {
        await wishlistApi.removeFromWishlist(product.id);
        setWishlistedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
        showToast('Removed from Wishlist', 'info');
      } else {
        await wishlistApi.addToWishlist(product.id);
        setWishlistedIds(prev => new Set([...prev, product.id]));
        showToast('Added to Wishlist ♥', 'success');
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="container page-content">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 'var(--text-md)', fontWeight: 400, color: 'var(--text-secondary)' }}>
          {filters.search
            ? <>Results for <strong style={{ color: 'var(--text-primary)' }}>"{filters.search}"</strong></>
            : filters.category
              ? <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {filters.category.replace(/-/g, ' ')}
                </strong>
              : 'All Products'
          }
          {pagination && (
            <span style={{ marginLeft: 8, fontWeight: 400 }}>
              ({pagination.total.toLocaleString()} results)
            </span>
          )}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
        {/* Filters Sidebar */}
        <ProductFilters filters={filters} onChange={setFilters} />

        {/* Product Grid + Pagination */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ProductGrid
            products={products}
            loading={loading}
            wishlistedIds={wishlistedIds}
            onWishlistToggle={handleWishlistToggle}
          />

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={filters.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              >
                ← Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={`page-btn ${filters.page === p ? 'active' : ''}`}
                    onClick={() => setFilters(f => ({ ...f, page: p }))}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                className="page-btn"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
