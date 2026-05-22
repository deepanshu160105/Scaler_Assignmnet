import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiLock, FiX, FiCreditCard } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatPrice';

// Card element styling to match our design system
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111',
      fontFamily: '"Inter", "Outfit", system-ui, sans-serif',
      '::placeholder': { color: '#aab7c4' },
      iconColor: '#FF9900',
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
};

// ── Inner form (must be inside <Elements> provider) ──────────────────────────
function PaymentForm({ clientSecret, amount, onSuccess, onCancel, placing }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError('');
    setLoading(true);

    try {
      const card = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment was not completed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || placing;

  return (
    <form onSubmit={handleSubmit}>
      {/* Order amount */}
      <div style={{
        background: 'linear-gradient(135deg, #0f3460, #1a7a59)',
        borderRadius: 8, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 }}>TOTAL AMOUNT</p>
          <p style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{formatPrice(amount)}</p>
        </div>
        <div style={{ fontSize: 36 }}>💳</div>
      </div>

      {/* Card element */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
          Card Information
        </label>
        <div style={{
          border: `2px solid ${error ? '#dc2626' : cardReady ? '#16a34a' : '#d1d5db'}`,
          borderRadius: 8, padding: '14px 16px',
          background: '#fff',
          transition: 'border-color 0.2s',
        }}>
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={e => {
              setCardReady(e.complete);
              setError(e.error?.message || '');
            }}
          />
        </div>
        {error && (
          <p style={{ color: '#dc2626', fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠ {error}
          </p>
        )}
      </div>

      {/* Test card hint */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fbbf24',
        borderRadius: 6, padding: '10px 14px', marginBottom: 20,
        fontSize: 12, color: '#92400e',
      }}>
        🧪 <strong>Test Mode:</strong> Use card <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>4242 4242 4242 4242</code> · Any future date · Any CVC
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          disabled={!stripe || !cardReady || isBusy}
          style={{
            flex: 1, padding: '13px 20px',
            background: isBusy || !cardReady ? '#9ca3af' : '#FF9900',
            color: 'white', border: 'none', borderRadius: 8,
            fontSize: 15, fontWeight: 700, cursor: isBusy || !cardReady ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
          }}
          id="confirm-stripe-payment-btn"
        >
          <FiLock size={15} />
          {isBusy ? 'Processing…' : `Pay ${formatPrice(amount)} Securely`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          style={{
            padding: '13px 16px', background: 'white',
            border: '1px solid #d1d5db', borderRadius: 8,
            cursor: 'pointer', color: '#374151',
          }}
        >
          <FiX />
        </button>
      </div>

      {/* Secure badge */}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <FiLock size={10} /> Secured by Stripe · 256-bit SSL
      </p>
    </form>
  );
}

// ── Modal wrapper (manages stripePromise lifecycle) ─────────────────────────
export default function StripePaymentModal({ isOpen, clientSecret, stripePromise, amount, onSuccess, onCancel, placing }) {
  if (!isOpen || !clientSecret || !stripePromise) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: 24,
        width: '100%', maxWidth: 440,
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        animation: 'fadeInUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#635bff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiCreditCard size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Complete Payment</h2>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Powered by Stripe</p>
          </div>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            clientSecret={clientSecret}
            amount={amount}
            onSuccess={onSuccess}
            onCancel={onCancel}
            placing={placing}
          />
        </Elements>
      </div>
    </div>
  );
}
