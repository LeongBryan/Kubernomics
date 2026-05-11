import type { NodeShapeCatalogEntry } from './providers'

const gcpRegions = ['asia-southeast1', 'us-central1', 'us-east1', 'europe-west1']

export const gcpCatalog: NodeShapeCatalogEntry[] = [
  { provider: 'gcp', sku: 'e2-standard-2', displayName: 'e2-standard-2', family: 'E2 standard', regionAvailability: gcpRegions, vcpu: 2, memoryMiB: 8192, hourlyCost: 0.067, currency: 'USD', defaultMaxPods: 110 },
  { provider: 'gcp', sku: 'e2-standard-4', displayName: 'e2-standard-4', family: 'E2 standard', regionAvailability: gcpRegions, vcpu: 4, memoryMiB: 16384, hourlyCost: 0.134, currency: 'USD', defaultMaxPods: 110 },
  { provider: 'gcp', sku: 'n2-standard-4', displayName: 'n2-standard-4', family: 'N2 standard', regionAvailability: gcpRegions, vcpu: 4, memoryMiB: 16384, hourlyCost: 0.194, currency: 'USD', defaultMaxPods: 110 },
  { provider: 'gcp', sku: 'n2-standard-8', displayName: 'n2-standard-8', family: 'N2 standard', regionAvailability: gcpRegions, vcpu: 8, memoryMiB: 32768, hourlyCost: 0.388, currency: 'USD', defaultMaxPods: 110 },
]
