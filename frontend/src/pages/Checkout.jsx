import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { FiPlus, FiMapPin, FiCreditCard, FiTruck, FiLock } from 'react-icons/fi';
import { addressApi } from '../api/addressApi';
import { orderApi }   from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';
import { useCart }    from '../context/CartContext';
import { useToast }   from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import Spinner            from '../components/ui/Spinner';
import Modal              from '../components/ui/Modal';
import StripePaymentModal from '../components/payment/StripePaymentModal';
import DemoPaymentModal   from '../components/payment/DemoPaymentModal';

const EMPTY_ADDR = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '', country: 'India',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart, clearCartLocally } = useCart();
  const { showToast } = useToast();

  // ── Address state ──────────────────────────────────────────────────────────
  const [addresses, setAddresses]     = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [newAddr, setNewAddr]             = useState(EMPTY_ADDR);
  const [savingAddr, setSavingAddr]       = useState(false);

  // ── Payment state ──────────────────────────────────────────────────────────
  const [payment, setPayment]   = useState('COD');  // 'COD' | 'STRIPE'
  const [placing, setPlacing]   = useState(false);

  // Stripe (real mode)
  const [stripePromise, setStripePromise]     = useState(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [clientSecret, setClientSecret]       = useState('');

  // Demo / Stripe shared
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [intentAmount, setIntentAmount]   = useState(0);
  const [isDemo, setIsDemo]               = useState(false);

  // ── Initialise: fetch Stripe config from backend ───────────────────────────
  useEffect(() => {
    paymentApi.getConfig()
      .then(res => {
        const { publishableKey, isDemo: demo } = res.data.data;
        setIsDemo(demo);
        if (!demo && publishableKey) {
          setStripePromise(loadStripe(publishableKey));
        }
      })
      .catch(() => setIsDemo(true)); // network error → fallback to demo
  }, []);

  // ── Load saved addresses ───────────────────────────────────────────────────
  useEffect(() => {
    addressApi.getAddresses()
      .then(res => {
        const list = res.data.data?.addresses || [];
        setAddresses(list);
        const def = list.find(a => a.isDefault) || list[0];
        if (def) setSelectedAddr(def.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Add address ────────────────────────────────────────────────────────────
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const res = await addressApi.addAddress(newAddr);
      const added = res.data.data?.address;
      setAddresses(prev => [...prev, added]);
      setSelectedAddr(added.id);
      setNewAddr(EMPTY_ADDR);
      setShowAddrModal(false);
      showToast('Address added!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add address', 'error');
    } finally { setSavingAddr(false); }
  };

  // ── Shared: place order after payment resolved ─────────────────────────────
  const submitOrder = useCallback(async (method, paymentIntentId = null) => {
    const payload = { addressId: selectedAddr, paymentMethod: method };
    if (paymentIntentId) payload.paymentIntentId = paymentIntentId;
    const res = await orderApi.placeOrder(payload);
    const order = res.data.data?.order;
    clearCartLocally();
    await fetchCart();
    showToast('Order placed successfully! 🎉', 'success');
    navigate(`/orders/${order.orderNumber}`);
  }, [selectedAddr, clearCartLocally, fetchCart, showToast, navigate]);

  // ── Place order: COD ───────────────────────────────────────────────────────
  const handlePlaceOrderCOD = async () => {
    if (!selectedAddr)        { showToast('Please select a delivery address', 'warning'); return; }
    if (!cart?.items?.length) { showToast('Your cart is empty', 'warning'); return; }
    setPlacing(true);
    try { await submitOrder('COD'); }
    catch (e) { showToast(e.response?.data?.message || 'Failed to place order', 'error'); }
    finally { setPlacing(false); }
  };

  // ── Place order: Stripe / Demo ─────────────────────────────────────────────
  const handlePlaceOrderStripe = async () => {
    if (!selectedAddr)        { showToast('Please select a delivery address', 'warning'); return; }
    if (!cart?.items?.length) { showToast('Your cart is empty', 'warning'); return; }

    setPlacing(true);
    try {
      const res = await paymentApi.createIntent();
      const { clientSecret: secret, paymentIntentId, amount, isDemo: demo } = res.data.data;

      setIntentAmount(amount);

      if (demo) {
        // Demo mode: show our custom form (no real Stripe)
        setDemoModalOpen(true);
      } else {
        // Real Stripe: show Elements modal
        setClientSecret(secret);
        setStripeModalOpen(true);
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not initialise payment', 'error');
    } finally { setPlacing(false); }
  };

  const handlePlaceOrder = () =>
    payment === 'STRIPE' ? handlePlaceOrderStripe() : handlePlaceOrderCOD();

  // ── Callbacks from modals ──────────────────────────────────────────────────
  const handlePaymentSuccess = async (paymentIntentId) => {
    setStripeModalOpen(false);
    setDemoModalOpen(false);
    setPlacing(true);
    try { await submitOrder('STRIPE', paymentIntentId); }
    catch (e) { showToast(e.response?.data?.message || 'Order placement failed', 'error'); }
    finally { setPlacing(false); }
  };

  const handlePaymentCancel = () => {
    setStripeModalOpen(false);
    setDemoModalOpen(false);
    setClientSecret('');
    showToast('Payment cancelled', 'info');
  };

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal >= 500 ? 0 : 40;
  const tax      = Math.round(subtotal * 0.18 * 100) / 100;
  const total    = subtotal + shipping + tax;

  if (loading) return <div className="spinner-center"><Spinner size="lg" /></div>;

  return (
    <div className="container page-content">
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 400, marginBottom: 16 }}>
        Checkout ({cart?.itemCount || 0} items)
      </h1>

      <div className="checkout-layout">
        <div>
          {/* ── Delivery Address ──────────────────────────────────── */}
          <div className="checkout-section">
            <h2 className="checkout-section-title"><FiMapPin style={{ marginRight: 8 }} />Delivery Address</h2>

            {addresses.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                No saved addresses. Please add one.
              </p>
            ) : addresses.map(addr => (
              <div
                key={addr.id}
                className={`address-radio-card ${selectedAddr === addr.id ? 'selected' : ''}`}
                onClick={() => setSelectedAddr(addr.id)}
              >
                <input type="radio" name="address" checked={selectedAddr === addr.id}
                  onChange={() => setSelectedAddr(addr.id)}
                  style={{ accentColor: 'var(--amazon-orange)', marginTop: 2 }} />
                <div>
                  <strong>{addr.fullName}</strong>
                  {addr.isDefault && <span className="badge badge-orange" style={{ marginLeft: 8, fontSize: 10 }}>Default</span>}
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br />
                    {addr.city}, {addr.state} – {addr.pincode}<br />
                    {addr.phone}
                  </p>
                </div>
              </div>
            ))}

            <button className="btn btn-outline btn-sm" onClick={() => setShowAddrModal(true)} id="add-address-btn">
              <FiPlus /> Add New Address
            </button>
          </div>

          {/* ── Payment Method ────────────────────────────────────── */}
          <div className="checkout-section">
            <h2 className="checkout-section-title"><FiCreditCard style={{ marginRight: 8 }} />Payment Method</h2>

            {/* COD */}
            <div className={`payment-option ${payment === 'COD' ? 'selected' : ''}`} onClick={() => setPayment('COD')}>
              <input type="radio" name="payment" checked={payment === 'COD'} onChange={() => setPayment('COD')} style={{ accentColor: 'var(--amazon-orange)' }} />
              <FiTruck size={20} />
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Pay in cash when your order is delivered</p>
              </div>
            </div>

            {/* Stripe / Demo Online */}
            <div
              className={`payment-option ${payment === 'STRIPE' ? 'selected' : ''}`}
              onClick={() => setPayment('STRIPE')}
              style={{ border: payment === 'STRIPE' ? '2px solid #635bff' : undefined }}
            >
              <input type="radio" name="payment" checked={payment === 'STRIPE'}
                onChange={() => setPayment('STRIPE')} style={{ accentColor: '#635bff' }} />

              {/* Logo area */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ background: '#635bff', borderRadius: 6, padding: '4px 10px' }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>
                    {isDemo ? 'DEMO' : 'stripe'}
                  </span>
                </div>
                {isDemo && (
                  <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                    TEST MODE
                  </span>
                )}
              </div>

              <div>
                <strong>Pay Online · Debit / Credit Card</strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {isDemo
                    ? 'Demo mode — no real money charged'
                    : 'Secured by Stripe · Cards, UPI, Net Banking'}
                </p>
              </div>
              <FiLock size={14} color="#635bff" style={{ marginLeft: 'auto' }} />
            </div>

            {/* Demo mode info */}
            {payment === 'STRIPE' && isDemo && (
              <div style={{
                background: '#f0f9ff', border: '1px solid #7dd3fc',
                borderRadius: 8, padding: '10px 14px', marginTop: 8,
                fontSize: 12, color: '#0369a1',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16 }}>🧪</span>
                <div>
                  <strong>Demo Payment Mode</strong> — A simulated card form will appear.
                  Use <code style={{ background: '#e0f2fe', padding: '1px 4px', borderRadius: 3 }}>4242 4242 4242 4242</code> as card number.
                  <br />To use real Stripe, add your keys to <code>backend/.env</code>.
                </div>
              </div>
            )}
          </div>

          {/* ── Order Items ───────────────────────────────────────── */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">📦 Items in this order</h2>
            {cart?.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <img
                  src={item.product?.images?.[0] || 'https://placehold.co/60x60?text=Item'}
                  alt={item.product?.name}
                  style={{ width: 60, height: 60, objectFit: 'contain', background: 'var(--bg-light)', borderRadius: 4, padding: 4 }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 'var(--text-sm)' }}>{item.product?.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                </div>
                <strong style={{ fontSize: 'var(--text-sm)' }}>
                  {formatPrice((item.priceAtPurchase ?? item.product?.price) * item.quantity)}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* ── Order Summary sidebar ────────────────────────────────── */}
        <div>
          <div className="cart-summary" style={{ position: 'sticky', top: 'calc(var(--nav-height) + var(--subnav-height) + 16px)' }}>
            <h3 style={{ marginBottom: 12, fontSize: 'var(--text-md)' }}>Order Summary</h3>
            <div className="cart-summary-row"><span>Items ({cart?.itemCount}):</span><span>{formatPrice(subtotal)}</span></div>
            <div className="cart-summary-row"><span>Shipping:</span><span>{shipping === 0 ? <span style={{ color: '#007600' }}>FREE</span> : formatPrice(shipping)}</span></div>
            <div className="cart-summary-row"><span>Tax (18% GST):</span><span>{formatPrice(tax)}</span></div>
            <div className="cart-summary-row total"><span>Order Total:</span><span>{formatPrice(total)}</span></div>

            <button
              className="btn btn-full btn-lg"
              style={{
                marginTop: 16, border: 'none', borderRadius: 8, color: 'white',
                background: payment === 'STRIPE' ? '#635bff' : 'var(--amazon-orange)',
                cursor: placing || !selectedAddr ? 'not-allowed' : 'pointer',
                opacity: placing || !selectedAddr ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddr}
              id="place-order-btn"
            >
              {payment === 'STRIPE' && <FiLock size={14} />}
              {placing
                ? 'Processing…'
                : payment === 'STRIPE'
                  ? `Pay ${formatPrice(total)}`
                  : 'Place your order'
              }
            </button>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center' }}>
              {payment === 'STRIPE'
                ? isDemo ? '🧪 Demo mode · No real money charged' : '🔒 Secured by Stripe'
                : 'By placing your order, you agree to our conditions of use.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── Add Address Modal ──────────────────────────────────────── */}
      <Modal isOpen={showAddrModal} onClose={() => setShowAddrModal(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress}>
          <div className="address-form-grid">
            <div className="input-group span-2"><label className="input-label">Full Name *</label><input className="input" required value={newAddr.fullName} onChange={e => setNewAddr(a => ({ ...a, fullName: e.target.value }))} /></div>
            <div className="input-group span-2"><label className="input-label">Phone Number *</label><input className="input" required value={newAddr.phone} onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} /></div>
            <div className="input-group span-2"><label className="input-label">Address Line 1 *</label><input className="input" required value={newAddr.addressLine1} onChange={e => setNewAddr(a => ({ ...a, addressLine1: e.target.value }))} placeholder="House No, Street, Area" /></div>
            <div className="input-group span-2"><label className="input-label">Address Line 2</label><input className="input" value={newAddr.addressLine2} onChange={e => setNewAddr(a => ({ ...a, addressLine2: e.target.value }))} placeholder="Landmark (optional)" /></div>
            <div className="input-group"><label className="input-label">City *</label><input className="input" required value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} /></div>
            <div className="input-group"><label className="input-label">State *</label><input className="input" required value={newAddr.state} onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))} /></div>
            <div className="input-group"><label className="input-label">Pincode *</label><input className="input" required value={newAddr.pincode} onChange={e => setNewAddr(a => ({ ...a, pincode: e.target.value }))} maxLength={6} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={savingAddr} id="save-address-btn">
              {savingAddr ? 'Saving…' : 'Add Address'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddrModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* ── Demo Payment Modal ─────────────────────────────────────── */}
      <DemoPaymentModal
        isOpen={demoModalOpen}
        amount={intentAmount}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        placing={placing}
      />

      {/* ── Real Stripe Payment Modal ──────────────────────────────── */}
      <StripePaymentModal
        isOpen={stripeModalOpen}
        clientSecret={clientSecret}
        stripePromise={stripePromise}
        amount={intentAmount}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        placing={placing}
      />
    </div>
  );
}
