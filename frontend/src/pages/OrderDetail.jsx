import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/formatPrice';
import { useToast } from '../context/ToastContext';

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderApi.getOrder(orderNumber)
      .then(res => setOrder(res.data.data?.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(orderNumber);
      setOrder(res.data.data?.order);
      showToast('Order cancelled successfully', 'info');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to cancel order', 'error');
    } finally { setCancelling(false); }
  };

  if (loading) return <div className="spinner-center"><Spinner size="lg" /></div>;
  if (!order) return null;

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="container page-content">
      <nav className="breadcrumb">
        <Link to="/orders">Your Orders</Link> <span>›</span>
        <span>Order #{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>ORDER PLACED</div>
            <div style={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>ORDER TOTAL</div>
            <div style={{ fontWeight: 700 }}>{formatPrice(order.totalAmount)}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>ORDER #</div>
            <div style={{ fontWeight: 700 }}>{order.orderNumber}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <OrderStatusBadge status={order.status} />
            {canCancel && (
              <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling} id="cancel-order-btn">
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {/* Status banner */}
          <div style={{ marginBottom: 20, padding: '12px 16px', background: order.status === 'DELIVERED' ? '#D4EDDA' : order.status === 'CANCELLED' ? '#F8D7DA' : '#CCE5FF', borderRadius: 4 }}>
            <strong>
              {order.status === 'PENDING' && '⏳ Your order has been placed and is being processed.'}
              {order.status === 'CONFIRMED' && '✓ Your order has been confirmed.'}
              {order.status === 'SHIPPED' && '🚚 Your order is on its way!'}
              {order.status === 'DELIVERED' && '✓ Your order has been delivered.'}
              {order.status === 'CANCELLED' && '✕ This order has been cancelled.'}
            </strong>
          </div>

          {/* Items */}
          <h3 style={{ marginBottom: 12 }}>Items Ordered</h3>
          {order.items?.map(item => (
            <div key={item.id} className="order-item-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
              <div className="order-item-img">
                <Link to={`/products/${item.product?.slug}`}>
                  <img src={item.product?.images?.[0] || 'https://placehold.co/70x70?text=Item'} alt={item.product?.name} />
                </Link>
              </div>
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.product?.slug}`} style={{ fontWeight: 600, color: 'var(--text-link)' }}>
                  {item.product?.name}
                </Link>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Qty: {item.quantity} · {formatPrice(item.priceAtPurchase)} each
                </p>
              </div>
              <strong>{formatPrice(item.priceAtPurchase * item.quantity)}</strong>
            </div>
          ))}

          {/* Summary */}
          <div style={{ maxWidth: 300, marginLeft: 'auto' }}>
            <div className="cart-summary-row"><span>Items subtotal:</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="cart-summary-row"><span>Shipping:</span><span>{order.shippingCost === 0 ? <span style={{ color: '#007600' }}>FREE</span> : formatPrice(order.shippingCost)}</span></div>
            <div className="cart-summary-row"><span>Tax (GST 18%):</span><span>{formatPrice(order.tax)}</span></div>
            <div className="cart-summary-row total"><span>Order Total:</span><span>{formatPrice(order.totalAmount)}</span></div>
          </div>
        </div>
      </div>

      {/* Delivery & Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 'var(--text-md)' }}>📍 Delivery Address</h3>
          {order.address && (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{order.address.fullName}</strong><br />
              {order.address.addressLine1}{order.address.addressLine2 ? ', ' + order.address.addressLine2 : ''}<br />
              {order.address.city}, {order.address.state} – {order.address.pincode}<br />
              Phone: {order.address.phone}
            </div>
          )}
        </div>
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 'var(--text-md)' }}>💳 Payment</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Method: <strong style={{ color: 'var(--text-primary)' }}>{order.paymentMethod}</strong><br />
            Status: <strong style={{ color: order.paymentStatus === 'COMPLETED' ? '#007600' : 'var(--text-secondary)' }}>
              {order.paymentStatus}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
