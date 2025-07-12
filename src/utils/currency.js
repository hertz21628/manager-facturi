// Currency configuration and utilities
export const CURRENCIES = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    position: 'before',
    decimalPlaces: 2,
    locale: 'en-US'
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    position: 'before',
    decimalPlaces: 2,
    locale: 'de-DE'
  },
  RON: {
    code: 'RON',
    name: 'Romanian Leu',
    symbol: 'lei',
    position: 'after',
    decimalPlaces: 2,
    locale: 'ro-RO'
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    position: 'before',
    decimalPlaces: 2,
    locale: 'en-GB'
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    position: 'before',
    decimalPlaces: 2,
    locale: 'en-CA'
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    position: 'before',
    decimalPlaces: 2,
    locale: 'en-AU'
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    position: 'before',
    decimalPlaces: 2,
    locale: 'de-CH'
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    position: 'before',
    decimalPlaces: 0,
    locale: 'ja-JP'
  }
};

// Get currency configuration
export const getCurrencyConfig = (currencyCode = 'USD') => {
  return CURRENCIES[currencyCode] || CURRENCIES.USD;
};

// Format currency amount
export const formatCurrency = (amount, currencyCode = 'USD', options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }

  const currency = getCurrencyConfig(currencyCode);
  const {
    showSymbol = true,
    showCode = false,
    compact = false,
    locale = currency.locale
  } = options;

  try {
    // Use Intl.NumberFormat for proper formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
      notation: compact ? 'compact' : 'standard'
    });

    let formatted = formatter.format(amount);

    // Custom formatting if needed
    if (!showSymbol) {
      // Remove currency symbol and code
      formatted = formatted.replace(/[^\d.,\s-]/g, '').trim();
    } else if (showCode) {
      // Ensure currency code is shown
      if (!formatted.includes(currencyCode)) {
        formatted = `${formatted} ${currencyCode}`;
      }
    }

    return formatted;
  } catch (error) {
    // Fallback formatting
    const num = parseFloat(amount).toFixed(currency.decimalPlaces);
    if (showSymbol) {
      return currency.position === 'before' 
        ? `${currency.symbol}${num}`
        : `${num} ${currency.symbol}`;
    }
    return num;
  }
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode = 'USD') => {
  const currency = getCurrencyConfig(currencyCode);
  return currency.symbol;
};

// Get currency name
export const getCurrencyName = (currencyCode = 'USD') => {
  const currency = getCurrencyConfig(currencyCode);
  return currency.name;
};

// Get all available currencies
export const getAvailableCurrencies = () => {
  return Object.values(CURRENCIES);
};

// Parse currency string to number
export const parseCurrency = (currencyString, currencyCode = 'USD') => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and non-numeric characters except decimal separators
  const cleaned = currencyString.replace(/[^\d.,\-\s]/g, '');
  
  // Handle different decimal separators
  const currency = getCurrencyConfig(currencyCode);
  const locale = currency.locale;
  
  // Determine decimal separator based on locale
  const decimalSeparator = locale.includes('de') || locale.includes('ro') ? ',' : '.';
  const thousandsSeparator = locale.includes('de') || locale.includes('ro') ? '.' : ',';
  
  // Replace thousands separator and convert decimal separator
  const normalized = cleaned
    .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`, 'g'), '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

// Convert between currencies (basic implementation - in real app, you'd use exchange rate API)
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRate = 1) => {
  if (fromCurrency === toCurrency) return amount;
  
  const converted = amount * exchangeRate;
  const toCurrencyConfig = getCurrencyConfig(toCurrency);
  
  return parseFloat(converted.toFixed(toCurrencyConfig.decimalPlaces));
};

// Validate currency code
export const isValidCurrency = (currencyCode) => {
  return CURRENCIES.hasOwnProperty(currencyCode);
};

// Get currency options for select dropdowns
export const getCurrencyOptions = () => {
  return Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name} (${currency.symbol})`
  }));
};

// Format currency for display in tables/lists
export const formatCurrencyCompact = (amount, currencyCode = 'USD') => {
  return formatCurrency(amount, currencyCode, { compact: true });
};

// Format currency without symbol
export const formatCurrencyAmount = (amount, currencyCode = 'USD') => {
  return formatCurrency(amount, currencyCode, { showSymbol: false });
};

// Format currency with code
export const formatCurrencyWithCode = (amount, currencyCode = 'USD') => {
  return formatCurrency(amount, currencyCode, { showCode: true });
}; 