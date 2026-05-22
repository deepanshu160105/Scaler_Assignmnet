export default function OrderStatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === 'PENDING'   && '⏳ Pending'}
      {status === 'CONFIRMED' && '✓ Confirmed'}
      {status === 'SHIPPED'   && '🚚 Shipped'}
      {status === 'DELIVERED' && '✓ Delivered'}
      {status === 'CANCELLED' && '✕ Cancelled'}
      {!['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'].includes(status) && status}
    </span>
  );
}
