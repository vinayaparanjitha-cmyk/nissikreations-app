export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${symbol} ${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateItemTotal(item: {
  width?: number;
  height?: number;
  quantity: number;
  unit: string;
  rate: number;
  discount: number; // in percentage (0-100) or 0
  taxPercent: number; // in percentage (0-28)
}): number {
  const qty = Number(item.quantity) || 1;
  const rate = Number(item.rate) || 0;
  let multiplier = 1;

  if (
    item.unit === 'sq.ft' ||
    item.unit === 'sq.ft.' ||
    item.unit === 'sq.inch' ||
    item.unit === 'sq.meter'
  ) {
    const w = Number(item.width) || 1;
    const h = Number(item.height) || 1;
    if (item.unit === 'sq.inch') {
      multiplier = (w * h) / 144; // sq inches to sq feet if rate is per sq.ft
    } else {
      multiplier = w * h;
    }
  }

  const basePrice = multiplier * qty * rate;
  const discountAmount = basePrice * ((Number(item.discount) || 0) / 100);
  const taxable = basePrice - discountAmount;
  const taxAmount = taxable * ((Number(item.taxPercent) || 0) / 100);
  return Math.round((taxable + taxAmount) * 100) / 100;
}

export function calculateDocumentTotals(items: Array<{
  width?: number;
  height?: number;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxPercent: number;
}>) {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate) || 0;
    let multiplier = 1;

    if (
      item.unit === 'sq.ft' ||
      item.unit === 'sq.ft.' ||
      item.unit === 'sq.inch' ||
      item.unit === 'sq.meter'
    ) {
      const w = Number(item.width) || 1;
      const h = Number(item.height) || 1;
      if (item.unit === 'sq.inch') {
        multiplier = (w * h) / 144;
      } else {
        multiplier = w * h;
      }
    }

    const basePrice = multiplier * qty * rate;
    const itemDiscount = basePrice * ((Number(item.discount) || 0) / 100);
    const taxable = basePrice - itemDiscount;
    const itemTax = taxable * ((Number(item.taxPercent) || 0) / 100);

    subtotal += basePrice;
    discountTotal += itemDiscount;
    taxTotal += itemTax;
  });

  const taxableAmount = subtotal - discountTotal;
  const grandTotal = Math.round((taxableAmount + taxTotal) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    grandTotal,
  };
}

export function getWhatsAppShareUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  if (cleanPhone.length >= 10) {
    const withCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${withCountry}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export function shareViaWhatsApp(phone: string, text: string): void {
  const url = getWhatsAppShareUrl(phone, text);
  window.open(url, '_blank');
}

export function getEmailShareUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
