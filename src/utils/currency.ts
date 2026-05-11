import type { CurrencyCode } from '../core/simulator'

export type { CurrencyCode }

export const currencyRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.8504,
  SGD: 1.2676,
}

export function convertFromUsd(value: number, currency: CurrencyCode): number {
  return value * currencyRates[currency]
}

export function formatCurrency(valueUsd: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertFromUsd(valueUsd, currency))
}
