export function getFinancialYear(date = new Date(), startMonth = 4): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= startMonth) {
    const endYear = (year + 1) % 100;
    return `${String(year % 100).padStart(2, '0')}${String(endYear).padStart(2, '0')}`;
  }
  const endYear = year % 100;
  const startYear = (year - 1) % 100;
  return `${String(startYear).padStart(2, '0')}${String(endYear).padStart(2, '0')}`;
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function invoiceScopeLabel(invoice: { project_name?: string | null }): string {
  const name = invoice.project_name?.trim();
  return name ? name : 'Other service';
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function generateInvoiceNumber(
  companyCode: string,
  financialYear: string,
  sequence: number,
): string {
  return `INV-${companyCode.toUpperCase()}-${financialYear}-${String(sequence).padStart(4, '0')}`;
}
