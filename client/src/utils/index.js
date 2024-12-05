export const formatPrice = (amount) => {
  return parseFloat(amount).toFixed(2);
};

export const shortenWalletAddress = (address, maxLength = 10) => {
  if (!address || address.length <= maxLength) return address;

  const visibleLength = Math.floor(maxLength / 2);
  const start = address.slice(0, visibleLength);
  const end = address.slice(-visibleLength);

  return `${start}...${end}`;
};
