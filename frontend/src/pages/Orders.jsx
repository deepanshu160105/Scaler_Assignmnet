import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/formatPrice';

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    orderApi.getOrders({ page, limit: 10 })
      .then(res => {
        setOrders(res.data.data?.orders || []);
        setTotalPages(res.data.data?.pagination?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="spinner-center"><Spinner size="lg" /></div>;

  return (
    <div className="container page-content">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 400, marginBottom: 20 }}>Your Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
          <Link to="/products"><button className="btn btn-primary btn-lg">Start Shopping</button></Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div className="order-header-group">
                  <span className="order-header-label">Order Placed</span>
                  <span className="order-header-value">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="order-header-group">
                  <span className="order-header-label">Total</span>
                  <span className="order-header-value">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="order-header-group">
                  <span className="order-header-label">Ship To</span>
                  <span className="order-header-value">{order.address?.fullName}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>ORDER # {order.orderNumber}</span>
                <Link to={`/orders/${order.orderNumber}`} className="btn btn-outline btn-sm">View Order</Link>
              </div>
            </div>

            <div className="order-card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <OrderStatusBadge status={order.status} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {order.paymentMethod} · {order.paymentStatus}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {order.items?.slice(0, 4).map(item => (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <img
                      src={item.product?.images?.[0] || 'https://placehold.co/70x70?text=Item'}
                      alt={item.product?.name}
                      style={{ width: 70, height: 70, objectFit: 'contain', background: 'var(--bg-light)', borderRadius: 4, padding: 4 }}
                    />
                    {item.quantity > 1 && (
                      <span style={{
                        position: 'absolute', bottom: 2, right: 2,
                        background: 'rgba(0,0,0,0.6)', color: 'white',
                        fontSize: 10, borderRadius: 10, padding: '1px 5px',
                      }}>×{item.quantity}</span>
                    )}
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div style={{ width: 70, height: 70, background: 'var(--bg-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
