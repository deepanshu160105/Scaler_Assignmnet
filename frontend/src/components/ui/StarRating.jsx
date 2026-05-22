import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating = 0, count = null, size = 14 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="stars" title={`${rating} out of 5`}>
      {stars.map(s => {
        const filled = rating >= s;
        const half   = !filled && rating >= s - 0.5;
        return (
          <span key={s} style={{ color: (filled || half) ? '#FF9900' : '#D5D9D9', fontSize: size }}>
            {filled ? '★' : half ? '⯨' : '☆'}
          </span>
        );
      })}
      {count !== null && (
        <span style={{ color: 'var(--text-link)', fontSize: size - 2, marginLeft: 4 }}>
          {count.toLocaleString()}
        </span>
      )}
    </span>
  );
}
