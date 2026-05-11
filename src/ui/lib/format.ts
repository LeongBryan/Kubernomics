import type { ResourceRequest } from '../../core/simulator'
import type { CurrencyCode } from '../../utils/currency'
import { formatCurrency } from '../../utils/currency'

export function cpu(millis: number): string {
  if (Math.abs(millis) >= 1000) return `${(millis / 1000).toFixed(millis % 1000 === 0 ? 0 : 1)} vCPU`
  return `${Math.round(millis)}m`
}

export function memory(mib: number): string {
  if (Math.abs(mib) >= 1024) return `${(mib / 1024).toFixed(mib % 1024 === 0 ? 0 : 1)} GiB`
  return `${Math.round(mib)} MiB`
}

export function money(valueUsd: number, currency: CurrencyCode = 'USD'): string {
  return formatCurrency(valueUsd, currency)
}

export function pct(value: number): string {
  return `${Math.round(value)}%`
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function resourceText(resources: ResourceRequest): string {
  return `${cpu(resources.cpuMillis)} / ${memory(resources.memoryMiB)}`
}
