export default function ProductFilters({ filters, onChange }) {
  const { category, minPrice, maxPrice, minRating, sort } = filters;

  const update = (key, val) => onChange({ ...filters, [key]: val, page: 1 });

  const SORTS = [
    { value: '',          label: 'Featured' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc',label: 'Price: High to Low' },
    { value: 'rating',    label: 'Avg. Customer Review' },
    { value: 'newest',    label: 'Newest Arrivals' },
  ];

  const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'electronics',  label: 'Electronics' },
    { value: 'food',         label: 'Food' },
    { value: 'clothing',     label: 'Clothing' },
    { value: 'home-kitchen', label: 'Home & Kitchen' },
    { value: 'sports',       label: 'Sports' },
    { value: 'toys-games',   label: 'Toys & Games' },
  ];

  const PRICE_RANGES = [
    { label: 'Under ₹500',        min: '',    max: '500' },
    { label: '₹500 – ₹1,000',    min: '500', max: '1000' },
    { label: '₹1,000 – ₹5,000',  min: '1000',max: '5000' },
    { label: '₹5,000 – ₹20,000', min: '5000',max: '20000' },
    { label: 'Over ₹20,000',      min: '20000',max: '' },
  ];

  const matchRange = (r) => r.min === (minPrice || '') && r.max === (maxPrice || '');

  return (
    <aside className="filters-panel">
      {/* Sort (mobile-friendly — shown here on sidebar too) */}
      <div className="filter-section">
        <p className="filter-title">Sort By</p>
        {SORTS.map(s => (
          <label key={s.value} className="filter-option">
            <input
              type="radio"
              name="sort"
              checked={sort === s.value}
              onChange={() => update('sort', s.value)}
            />
            {s.label}
          </label>
        ))}
      </div>

      {/* Category */}
      <div className="filter-section">
        <p className="filter-title">Department</p>
        {CATEGORIES.map(c => (
          <label key={c.value} className="filter-option">
            <input
              type="radio"
              name="category"
              checked={category === c.value}
              onChange={() => update('category', c.value)}
            />
            {c.label}
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="filter-section">
        <p className="filter-title">Price</p>
        {PRICE_RANGES.map(r => (
          <label key={r.label} className="filter-option">
            <input
              type="radio"
              name="price"
              checked={matchRange(r)}
              onChange={() => onChange({ ...filters, minPrice: r.min, maxPrice: r.max, page: 1 })}
            />
            {r.label}
          </label>
        ))}
        <label className="filter-option">
          <input
            type="radio"
            name="price"
            checked={!PRICE_RANGES.some(matchRange) && !minPrice && !maxPrice}
            onChange={() => onChange({ ...filters, minPrice: '', maxPrice: '', page: 1 })}
          />
          Any Price
        </label>
      </div>

      {/* Rating */}
      <div className="filter-section">
        <p className="filter-title">Avg. Customer Review</p>
        {[4, 3, 2, 1].map(r => (
          <label key={r} className="filter-option">
            <input
              type="radio"
              name="rating"
              checked={minRating === String(r)}
              onChange={() => update('minRating', String(r))}
            />
            {'★'.repeat(r)}{'☆'.repeat(5 - r)} & Up
          </label>
        ))}
        <label className="filter-option">
          <input
            type="radio"
            name="rating"
            checked={!minRating}
            onChange={() => update('minRating', '')}
          />
          Any Rating
        </label>
      </div>

      {/* Clear all */}
      <button
        className="btn btn-outline btn-sm btn-full"
        onClick={() => onChange({ category: '', sort: '', minPrice: '', maxPrice: '', minRating: '', page: 1, search: filters.search })}
      >
        Clear All Filters
      </button>
    </aside>
  );
}
