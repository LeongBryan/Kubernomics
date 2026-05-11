import type { CloudProvider, CurrencyCode, NodePool, ScenarioCloudSettings } from '../core/simulator'
import { formatCurrency } from '../utils/currency'
import { azureCatalog } from './azure'
import { awsCatalog } from './aws'
import { customCatalog } from './custom'
import { gcpCatalog } from './gcp'

export type ProviderOption = {
  id: CloudProvider
  label: string
}

export type RegionOption = {
  id: string
  label: string
}

export type NodeShapeCatalogEntry = {
  provider: CloudProvider
  sku: string
  displayName: string
  family?: string
  regionAvailability?: string[]
  vcpu: number
  memoryMiB: number
  defaultMaxPods?: number
  hourlyCost?: number
  currency?: CurrencyCode
  reservedCPUm?: number
  reservedMemoryMiB?: number
}

export const DEFAULT_CLOUD: ScenarioCloudSettings = {
  provider: 'azure',
  region: 'southeastasia',
  currency: 'USD',
}

export const providerOptions: ProviderOption[] = [
  { id: 'azure', label: 'Azure / AKS' },
  { id: 'aws', label: 'AWS / EKS' },
  { id: 'gcp', label: 'GCP / GKE' },
  { id: 'custom', label: 'Custom' },
]

export const regionOptionsByProvider: Record<CloudProvider, RegionOption[]> = {
  azure: [
    { id: 'southeastasia', label: 'Southeast Asia' },
    { id: 'eastasia', label: 'East Asia' },
    { id: 'westeurope', label: 'West Europe' },
    { id: 'eastus', label: 'East US' },
    { id: 'westus', label: 'West US' },
  ],
  aws: [
    { id: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { id: 'us-east-1', label: 'US East (N. Virginia)' },
    { id: 'us-west-2', label: 'US West (Oregon)' },
    { id: 'eu-west-1', label: 'Europe (Ireland)' },
  ],
  gcp: [
    { id: 'asia-southeast1', label: 'Singapore' },
    { id: 'us-central1', label: 'Iowa' },
    { id: 'us-east1', label: 'South Carolina' },
    { id: 'europe-west1', label: 'Belgium' },
  ],
  custom: [{ id: 'custom', label: 'Custom' }],
}

export const currencyOptions: CurrencyCode[] = ['USD', 'EUR', 'SGD']

const catalogs: Record<CloudProvider, NodeShapeCatalogEntry[]> = {
  azure: azureCatalog,
  aws: awsCatalog,
  gcp: gcpCatalog,
  custom: customCatalog,
}

export function providerLabel(provider: CloudProvider): string {
  return providerOptions.find((option) => option.id === provider)?.label ?? provider
}

export function regionLabel(provider: CloudProvider, region: string): string {
  return regionOptionsByProvider[provider].find((option) => option.id === region)?.label ?? region
}

export function defaultRegionForProvider(provider: CloudProvider): string {
  return regionOptionsByProvider[provider][0]?.id ?? 'custom'
}

export function nodeShapeCatalog(provider: CloudProvider, region: string): NodeShapeCatalogEntry[] {
  const entries = catalogs[provider] ?? []
  return entries.filter((entry) => !entry.regionAvailability?.length || entry.regionAvailability.includes(region))
}

export function defaultShapeForProvider(provider: CloudProvider, region = defaultRegionForProvider(provider)): NodeShapeCatalogEntry {
  return nodeShapeCatalog(provider, region)[0] ?? customCatalog[0]
}

export function findCatalogShape(provider: CloudProvider, sku: string, region: string): NodeShapeCatalogEntry | undefined {
  return nodeShapeCatalog(provider, region).find((entry) => entry.sku === sku)
}

export function nodeShapePatch(
  entry: NodeShapeCatalogEntry,
  region: string
): Pick<NodePool, 'shape' | 'hourlyCost' | 'maxPods' | 'systemReserved' | 'kubeReserved'> {
  return {
    shape: {
      id: `${entry.provider}-${entry.sku}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: entry.displayName,
      provider: entry.provider,
      providerSku: entry.sku,
      region,
      vcpu: entry.vcpu,
      memoryMiB: entry.memoryMiB,
      hourlyCost: entry.hourlyCost,
      currency: entry.currency,
    },
    hourlyCost: entry.hourlyCost,
    maxPods: entry.defaultMaxPods ?? 110,
    systemReserved: {
      cpuMillis: entry.reservedCPUm ?? 0,
      memoryMiB: entry.reservedMemoryMiB ?? 0,
    },
    kubeReserved: { cpuMillis: 0, memoryMiB: 0 },
  }
}

export function shapeOptionLabel(entry: NodeShapeCatalogEntry, currency: CurrencyCode): string {
  const memoryGiB = entry.memoryMiB / 1024
  const price = entry.hourlyCost === undefined ? 'manual cost' : `${formatCurrency(entry.hourlyCost, currency)}/hr`
  return `${entry.displayName} - ${entry.vcpu} vCPU / ${memoryGiB} GiB - ${price}`
}
