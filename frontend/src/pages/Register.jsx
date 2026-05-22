import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Step 1: Email, Step 2: OTP, Step 3: Password + Name
export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [step, setStep]   = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp]     = useState(['', '', '', '', '', '']);
  const [name, setName]   = useState('');
  const [pass, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = Array.from({ length: 6 }, () => useRef(null));
  const timerRef = useRef(null);

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.sendOtp(email);
      setStep(2);
      setResendTimer(60);
      showToast('OTP sent to your email!', 'success');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  // OTP input handlers
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
    if (e.key === 'ArrowLeft' && i > 0) otpRefs[i - 1].current?.focus();
    if (e.key === 'ArrowRight' && i < 5) otpRefs[i + 1].current?.focus();
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs[5].current?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.verifyOtp(email, code);
      setStep(3);
      showToast('Email verified!', 'success');
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  // Step 3: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (pass.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authApi.register(name, email, pass);
      login(res.data.data.user, res.data.data.token);
      showToast(`Welcome, ${res.data.data.user.name}! 🎉`, 'success');
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-text">amazon<span>.in</span></div>
      </div>

      <div className="auth-card">
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: s <= step ? 'var(--amazon-orange)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <h1 className="auth-title">Create account</h1>
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="input-group">
                <label className="input-label" htmlFor="reg-email">Your email</label>
                <input
                  id="reg-email"
                  type="email"
                  className={`input ${error ? 'input-error' : ''}`}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  required autoFocus
                  placeholder="you@example.com"
                />
                {error && <p className="input-error-msg">{error}</p>}
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="send-otp-btn">
                {loading ? 'Sending OTP…' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <>
            <h1 className="auth-title">Verify your email</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    id={`otp-input-${i}`}
                  />
                ))}
              </div>
              {error && <p className="input-error-msg" style={{ textAlign: 'center', marginTop: 8 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 20 }} id="verify-otp-btn">
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 'var(--text-sm)' }}>
              {resendTimer > 0
                ? <span style={{ color: 'var(--text-secondary)' }}>Resend OTP in {resendTimer}s</span>
                : <button className="btn btn-link" onClick={handleSendOtp} disabled={loading} id="resend-otp-btn">Resend OTP</button>
              }
            </div>
            <button className="btn btn-link btn-sm" style={{ marginTop: 8, display: 'block', textAlign: 'left' }} onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}>
              ← Change email
            </button>
          </>
        )}

        {/* Step 3: Name + Password */}
        {step === 3 && (
          <>
            <h1 className="auth-title">Complete your account</h1>
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="input-group">
                <label className="input-label" htmlFor="reg-name">Your name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="input"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  required autoFocus
                  placeholder="First and last name"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="reg-pass">Password</label>
                <input
                  id="reg-pass"
                  type="password"
                  className={`input ${error ? 'input-error' : ''}`}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(''); }}
                  required
                  placeholder="At least 6 characters"
                  minLength={6}
                />
                {error && <p className="input-error-msg">{error}</p>}
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="register-submit-btn">
                {loading ? 'Creating account…' : 'Create your Amazon Clone account'}
              </button>
            </form>
          </>
        )}

        <div className="auth-link-row">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
