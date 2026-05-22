import ProductCard from './ProductCard';
import Spinner from '../ui/Spinner';

export default function ProductGrid({ products, loading, wishlistedIds = new Set(), onWishlistToggle }) {
  if (loading) return <div className="spinner-center"><Spinner size="lg" /></div>;

  if (!products?.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map(p => (
        <div key={p.id} style={{ position: 'relative' }}>
          <ProductCard
            product={p}
            isWishlisted={wishlistedIds.has(p.id)}
            onWishlistToggle={onWishlistToggle}
          />
        </div>
      ))}
    </div>
  );
}
