/**
 * Pakistani Rupee (PKR) Currency Utilities
 * Handles formatting, conversion, and display of PKR amounts
 */

export const PKR_CURRENCY = {
  code: 'PKR',
  symbol: '₨',
  name: 'Pakistani Rupee',
  decimals: 2,
  locale: 'en-PK'
}

/**
 * Format amount in Pakistani Rupees with proper formatting
 * @param amount - The amount to format
 * @param options - Formatting options
 */
export function formatPKR(
  amount: number | string,
  options: {
    showSymbol?: boolean
    showCode?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    compact?: boolean
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    compact = false
  } = options

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return showSymbol ? '₨ 0' : '0'
  }

  // For compact formatting (K, M, B, etc.)
  if (compact) {
    return formatPKRCompact(numAmount, showSymbol, showCode)
  }

  // Standard formatting with Pakistani locale
  const formatter = new Intl.NumberFormat('en-PK', {
    style: 'decimal',
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: true
  })

  const formattedAmount = formatter.format(numAmount)
  
  let result = ''
  if (showSymbol) {
    result = `₨ ${formattedAmount}`
  } else {
    result = formattedAmount
  }
  
  if (showCode) {
    result += ' PKR'
  }
  
  return result
}

/**
 * Format large amounts in compact form (K, M, B, etc.)
 */
function formatPKRCompact(amount: number, showSymbol: boolean, showCode: boolean): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  
  let value: number
  let suffix: string
  
  if (abs >= 1e12) {
    value = amount / 1e12
    suffix = 'T' // Trillion
  } else if (abs >= 1e9) {
    value = amount / 1e9
    suffix = 'B' // Billion
  } else if (abs >= 1e6) {
    value = amount / 1e6
    suffix = 'M' // Million
  } else if (abs >= 1e5) {
    value = amount / 1e5
    suffix = 'L' // Lakh (Pakistani/Indian numbering)
  } else if (abs >= 1e3) {
    value = amount / 1e3
    suffix = 'K' // Thousand
  } else {
    return formatPKR(amount, { showSymbol, showCode, compact: false })
  }
  
  const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(1)
  
  let result = `${sign}${formattedValue}${suffix}`
  
  if (showSymbol) {
    result = `₨ ${result}`
  }
  
  if (showCode) {
    result += ' PKR'
  }
  
  return result
}

/**
 * Parse PKR string back to number
 */
export function parsePKR(value: string): number {
  if (!value) return 0
  
  // Remove PKR symbols and whitespace
  const cleaned = value.replace(/[₨,\sPKR]/g, '')
  
  // Handle compact notation
  const compactMatch = cleaned.match(/^(-?\d+\.?\d*)([KMLTB])$/i)
  if (compactMatch) {
    const [, num, suffix] = compactMatch
    const baseValue = parseFloat(num)
    
    switch (suffix.toUpperCase()) {
      case 'K': return baseValue * 1e3
      case 'M': return baseValue * 1e6
      case 'L': return baseValue * 1e5
      case 'B': return baseValue * 1e9
      case 'T': return baseValue * 1e12
      default: return baseValue
    }
  }
  
  return parseFloat(cleaned) || 0
}

/**
 * Format percentage with Pakistani context
 */
export function formatPKRPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format return on investment in PKR
 */
export function formatPKRReturn(
  investedAmount: number,
  currentValue: number,
  options: { showPercentage?: boolean; showAmount?: boolean } = {}
): string {
  const { showPercentage = true, showAmount = true } = options
  
  const returnAmount = currentValue - investedAmount
  const returnPercentage = investedAmount > 0 ? (returnAmount / investedAmount) * 100 : 0
  
  const sign = returnAmount >= 0 ? '+' : ''
  const color = returnAmount >= 0 ? 'green' : 'red'
  
  let result = ''
  
  if (showAmount) {
    result += `${sign}${formatPKR(returnAmount)}`
  }
  
  if (showPercentage && showAmount) {
    result += ` (${sign}${formatPKRPercentage(returnPercentage)})`
  } else if (showPercentage) {
    result = `${sign}${formatPKRPercentage(returnPercentage)}`
  }
  
  return result
}

/**
 * Get Pakistani Rupee exchange rate context
 */
export function getPKRContext() {
  return {
    currency: PKR_CURRENCY,
    commonAmounts: {
      minimum: 1000, // ₨ 1,000 minimum investment
      small: 10000, // ₨ 10,000
      medium: 100000, // ₨ 1,00,000 (1 Lakh)
      large: 1000000, // ₨ 10,00,000 (10 Lakh)
      veryLarge: 10000000 // ₨ 1,00,00,000 (1 Crore)
    },
    displayFormats: {
      compact: true,
      showSymbol: true,
      decimals: 0 // Typically PKR doesn't show decimals for large amounts
    }
  }
}

/**
 * Validate PKR amount input
 */
export function validatePKRAmount(value: string | number, min: number = 0, max?: number): {
  isValid: boolean
  error?: string
  amount?: number
} {
  const amount = typeof value === 'string' ? parsePKR(value) : value
  
  if (isNaN(amount)) {
    return { isValid: false, error: 'Invalid amount format' }
  }
  
  if (amount < min) {
    return { isValid: false, error: `Minimum amount is ${formatPKR(min)}` }
  }
  
  if (max && amount > max) {
    return { isValid: false, error: `Maximum amount is ${formatPKR(max)}` }
  }
  
  return { isValid: true, amount }
}

/**
 * Convert amount to words in Pakistani context
 */
export function amountToWordsPKR(amount: number): string {
  if (amount === 0) return 'Zero Rupees'
  
  const crores = Math.floor(amount / 10000000)
  const lakhs = Math.floor((amount % 10000000) / 100000)
  const thousands = Math.floor((amount % 100000) / 1000)
  const hundreds = Math.floor((amount % 1000) / 100)
  const remainder = amount % 100
  
  let result = ''
  
  if (crores > 0) {
    result += `${crores} Crore${crores > 1 ? 's' : ''} `
  }
  
  if (lakhs > 0) {
    result += `${lakhs} Lakh${lakhs > 1 ? 's' : ''} `
  }
  
  if (thousands > 0) {
    result += `${thousands} Thousand `
  }
  
  if (hundreds > 0) {
    result += `${hundreds} Hundred `
  }
  
  if (remainder > 0) {
    result += `${remainder} `
  }
  
  return `${result.trim()} Rupees`
}

export default {
  format: formatPKR,
  parse: parsePKR,
  formatPercentage: formatPKRPercentage,
  formatReturn: formatPKRReturn,
  validate: validatePKRAmount,
  toWords: amountToWordsPKR,
  context: getPKRContext(),
  currency: PKR_CURRENCY
}
