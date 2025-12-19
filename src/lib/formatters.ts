// Phone formatting utilities
export function formatPhoneE164(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 55, assume it's already with country code
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }
  
  // Otherwise, add Brazil country code
  return `+55${digits}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XX) XXXXX-XXXX for Brazilian numbers
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
}

export function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Currency formatting utilities
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrencyInput(input: string): number {
  // Replace comma with dot and remove non-numeric chars except dot
  const normalized = input.replace(',', '.').replace(/[^\\d.]/g, '');
  const value = parseFloat(normalized);
  return isNaN(value) ? 0 : value;
}

export function applyCurrencyMask(value: string): string {
  // Allow only digits and one comma/dot
  let cleaned = value.replace(/[^\\d,.]/g, '');
  
  // Replace dot with comma for display
  cleaned = cleaned.replace('.', ',');
  
  // Ensure only one comma
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + ',' + parts[1].slice(0, 2);
  }
  
  return cleaned;
}

// Date formatting
export function formatDateTime(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
}
