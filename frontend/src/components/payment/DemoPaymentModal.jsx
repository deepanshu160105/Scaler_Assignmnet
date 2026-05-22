import { useState } from 'react';
import { FiLock, FiX, FiCreditCard, FiCheck } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatPrice';

// Luhn-check helper for realistic card validation UX
const luhn = (num) => {
  const digits = num.replace(/\D/g, '').split('').map(Number);
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
};

const getCardType = (num) => {
  if (/^4/.test(num)) return { label: 'Visa', color: '#1a1f71', symbol: 'VISA' };
  if (/^5[1-5]/.test(num)) return { label: 'Mastercard', color: '#EB001B', symbol: 'MC' };
  if (/^3[47]/.test(num)) return { label: 'Amex', color: '#007bc1', symbol: 'AMEX' };
  if (/^6/.test(num)) return { label: 'RuPay', color: '#FF6600', symbol: 'RuPay' };
  return null;
};

const fmtCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExpiry = (val) => {
  const d = val.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
};

export default function DemoPaymentModal({ isOpen, amount, onSuccess, onCancel, placing }) {
  const [card, setCard]     = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc]       = useState('');
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [step, setStep]     = useState('form'); // 'form' | 'processing' | 'success'

  if (!isOpen) return null;

  const rawCard = card.replace(/\s/g, '');
  const cardType = getCardType(rawCard);
  const cardValid  = rawCard.length === 16;
  const expiryValid = /^\d{2}\/\d{2}$/.test(expiry);
  const cvcValid   = cvc.length >= 3;
  const nameValid  = name.trim().length >= 2;
  const formValid  = cardValid && expiryValid && cvcValid && nameValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Simulate validation
    if (!luhn(rawCard) && rawCard !== '4242424242424242') {
      setError('Card number is invalid.');
      return;
    }
    const [month, year] = expiry.split('/');
    const now = new Date();
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expDate < now) { setError('Card has expired.'); return; }

    // Simulate declined card (use 4000000000000002 to test decline)
    if (rawCard === '4000000000000002') {
      setError('Your card was declined. Please try a different card.');
      return;
    }

    setLoading(true);
    setStep('processing');

    // Simulate 2s payment processing delay
    await new Promise(r => setTimeout(r, 2000));
    setStep('success');
    await new Promise(r => setTimeout(r, 800));

    setLoading(false);
    onSuccess(`demo_pi_confirmed_${Date.now()}`);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '0 0 24px',
        width: '100%', maxWidth: 440, overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
      }}>
        {/* ── Header gradient ─────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#635bff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCreditCard size={18} color="white" />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>Secure Checkout</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 }}>Demo Payment • Test Mode</p>
              </div>
            </div>
            <button onClick={onCancel} disabled={loading} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <FiX size={16} />
            </button>
          </div>

          {/* Amount display */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Total Amount</span>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 22 }}>{formatPrice(amount)}</span>
          </div>
        </div>

        <div style={{ padding: '20px 24px 0' }}>
          {/* ── Processing screen ──────────────────────────── */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #f0f0f0', borderTopColor: '#635bff', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontWeight: 700, fontSize: 16 }}>Processing Payment…</p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Please wait, do not close this window</p>
            </div>
          )}

          {/* ── Success screen ─────────────────────────────── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FiCheck size={32} color="#16a34a" strokeWidth={3} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#16a34a' }}>Payment Successful!</p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Placing your order…</p>
            </div>
          )}

          {/* ── Card form ──────────────────────────────────── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              {/* Card number */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Card Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={card}
                    onChange={e => setCard(fmtCard(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    style={{
                      width: '100%', padding: '11px 48px 11px 14px',
                      border: `1.5px solid ${error && !cardValid ? '#dc2626' : cardValid ? '#16a34a' : '#d1d5db'}`,
                      borderRadius: 8, fontSize: 15, outline: 'none',
                      fontFamily: 'monospace', letterSpacing: 1, boxSizing: 'border-box',
                    }}
                    id="demo-card-number"
                  />
                  {cardType && (
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 900, color: cardType.color, letterSpacing: 0.5 }}>
                      {cardType.symbol}
                    </div>
                  )}
                </div>
              </div>

              {/* Name on card */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Name on Card</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  placeholder="DEEPANSHU SHARMA"
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: `1.5px solid ${nameValid ? '#16a34a' : '#d1d5db'}`,
                    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}
                  id="demo-card-name"
                />
              </div>

              {/* Expiry + CVC */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Expiry (MM/YY)</label>
                  <input
                    value={expiry}
                    onChange={e => setExpiry(fmtExpiry(e.target.value))}
                    placeholder="12/26"
                    maxLength={5}
                    style={{
                      width: '100%', padding: '11px 14px',
                      border: `1.5px solid ${expiryValid ? '#16a34a' : '#d1d5db'}`,
                      borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'monospace',
                    }}
                    id="demo-card-expiry"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>CVC</label>
                  <input
                    value={cvc}
                    onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    type="password"
                    style={{
                      width: '100%', padding: '11px 14px',
                      border: `1.5px solid ${cvcValid ? '#16a34a' : '#d1d5db'}`,
                      borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'monospace',
                    }}
                    id="demo-card-cvc"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 13, color: '#dc2626' }}>
                  ⚠ {error}
                </div>
              )}

              {/* Test cards hint */}
              <div style={{
                background: '#f8faff', border: '1px solid #c7d2fe',
                borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 11, color: '#4338ca',
              }}>
                <p style={{ fontWeight: 700, margin: '0 0 4px' }}>🧪 Demo Mode — Use these test cards:</p>
                <p style={{ margin: '2px 0', fontFamily: 'monospace' }}>✅ <strong>4242 4242 4242 4242</strong> — Success</p>
                <p style={{ margin: '2px 0', fontFamily: 'monospace' }}>❌ <strong>4000 0000 0000 0002</strong> — Declined</p>
                <p style={{ margin: '4px 0 0', color: '#6366f1' }}>Any future expiry · Any 3-digit CVC · Any name</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!formValid || placing}
                style={{
                  width: '100%', padding: '14px',
                  background: formValid ? '#635bff' : '#9ca3af',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  cursor: formValid ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s',
                }}
                id="demo-pay-btn"
              >
                <FiLock size={14} />
                Pay {formatPrice(amount)} Securely
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <FiLock size={9} /> Demo Mode · No real money charged
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
