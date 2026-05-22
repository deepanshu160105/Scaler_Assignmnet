// Format a number as Indian Rupee price string
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0';
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// Return the integer part only (no decimals)
export const formatPriceInt = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
};
