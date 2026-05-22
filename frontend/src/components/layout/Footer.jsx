import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer-top" onClick={scrollTop}>
        Back to top
      </div>

      <div className="footer-links">
        <div className="footer-col">
          <h4>Get to Know Us</h4>
          <Link to="#">About Amazon</Link>
          <Link to="#">Careers</Link>
          <Link to="#">Press Releases</Link>
          <Link to="#">Amazon Cares</Link>
          <Link to="#">Gift a Smile</Link>
        </div>
        <div className="footer-col">
          <h4>Connect with Us</h4>
          <Link to="#">Facebook</Link>
          <Link to="#">Twitter</Link>
          <Link to="#">Instagram</Link>
        </div>
        <div className="footer-col">
          <h4>Make Money with Us</h4>
          <Link to="#">Sell on Amazon</Link>
          <Link to="#">Sell under Amazon Accelerator</Link>
          <Link to="#">Amazon Associates</Link>
          <Link to="#">Fulfilment by Amazon</Link>
          <Link to="#">Advertise Your Products</Link>
        </div>
        <div className="footer-col">
          <h4>Let Us Help You</h4>
          <Link to="#">COVID-19 and Amazon</Link>
          <Link to="#">Your Account</Link>
          <Link to="#">Returns Centre</Link>
          <Link to="#">100% Purchase Protection</Link>
          <Link to="#">Help</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div style={{ marginBottom: 8 }}>
          <Link to="/" style={{ color: '#FF9900', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
            amazon<span style={{ color: '#ccc' }}>.in</span>
          </Link>
        </div>
        <p>© 1996–2026, Amazon.com, Inc. or its affiliates</p>
        <p style={{ marginTop: 4 }}>
          <Link to="#" style={{ color: 'var(--text-secondary)', margin: '0 8px' }}>Conditions of Use & Sale</Link>
          <Link to="#" style={{ color: 'var(--text-secondary)', margin: '0 8px' }}>Privacy Notice</Link>
          <Link to="#" style={{ color: 'var(--text-secondary)', margin: '0 8px' }}>Interest-Based Ads Notice</Link>
        </p>
      </div>
    </footer>
  );
}
