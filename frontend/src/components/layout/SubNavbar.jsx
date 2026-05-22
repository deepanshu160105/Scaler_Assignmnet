import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryApi } from '../../api/categoryApi';

// Static fallback while categories load
const STATIC_LINKS = [
  { label: "Today's Deals", slug: '' },
  { label: 'Electronics',   slug: 'electronics' },
  { label: 'Food',           slug: 'food' },
  { label: 'Clothing',      slug: 'clothing' },
  { label: 'Home & Kitchen', slug: 'home-kitchen' },
  { label: 'Sports',        slug: 'sports' },
  { label: 'Toys & Games',  slug: 'toys-games' },
];

export default function SubNavbar() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryApi.getCategories()
      .then(res => setCategories(res.data.data?.categories || []))
      .catch(() => {});
  }, []);

  // Build nav items: "Today's Deals" always first, then real categories
  const navItems = [
    { label: "Today's Deals", slug: '' },
    ...(categories.length > 0
      ? categories.map(c => ({ label: c.name, slug: c.slug }))
      : STATIC_LINKS.slice(1)
    ),
  ];

  return (
    <div className="subnav">
      <div className="subnav-inner">
        {navItems.map(cat => (
          <Link
            key={cat.slug}
            to={cat.slug ? `/products?category=${cat.slug}` : '/products'}
            className={`subnav-link ${currentCategory === cat.slug ? 'active' : ''}`}
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
