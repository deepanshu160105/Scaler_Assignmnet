import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const from = location.state?.from?.pathname || '/';

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.data.data.user, res.data.data.token);
      showToast(`Welcome back, ${res.data.data.user.name}!`, 'success');
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-text">amazon<span>.in</span></div>
      </div>

      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className={`input ${error ? 'input-error' : ''}`}
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className={`input ${error ? 'input-error' : ''}`}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
            />
            {error && <p className="input-error-msg">{error}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="login-submit-btn">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '12px 0', textAlign: 'center' }}>
          By continuing, you agree to Amazon Clone's <a href="#">Conditions of Use</a> and <a href="#">Privacy Notice</a>.
        </div>
      </div>

      <div style={{ maxWidth: 360, margin: '16px auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span>New to Amazon Clone?</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <button
          className="btn btn-outline btn-full"
          onClick={() => navigate('/register')}
          id="go-to-register-btn"
        >
          Create your Amazon Clone account
        </button>
      </div>
    </div>
  );
}
