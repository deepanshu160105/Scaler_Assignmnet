import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page-content" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>📦</div>
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>404 — Page not found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
        The Web address you entered is not a functioning page on our site.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/"><button className="btn btn-primary btn-lg">Go to Amazon Clone Home Page</button></Link>
        <Link to="/products"><button className="btn btn-outline btn-lg">Browse Products</button></Link>
      </div>
    </div>
  );
}
