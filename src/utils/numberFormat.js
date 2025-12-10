export const formatCompact = (value, fractionDigits = 2) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return String(value ?? '');
  }
  try {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: fractionDigits,
    }).format(Number(value));
  } catch (e) {
    return Number(value).toLocaleString('en-US');
  }
};

export const formatAddressShort = (address) => {
  if (!address) return '';
  const addr = String(address);
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
};



