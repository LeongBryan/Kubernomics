import type { NodeShapeCatalogEntry } from './providers'

const awsRegions = ['ap-southeast-1', 'us-east-1', 'us-west-2', 'eu-west-1']

export const awsCatalog: NodeShapeCatalogEntry[] = [
  { provider: 'aws', sku: 't3.large', displayName: 't3.large', family: 'Burstable', regionAvailability: awsRegions, vcpu: 2, memoryMiB: 8192, hourlyCost: 0.0832, currency: 'USD', defaultMaxPods: 35 },
  { provider: 'aws', sku: 'm6i.xlarge', displayName: 'm6i.xlarge', family: 'General purpose', regionAvailability: awsRegions, vcpu: 4, memoryMiB: 16384, hourlyCost: 0.192, currency: 'USD', defaultMaxPods: 58 },
  { provider: 'aws', sku: 'm6i.2xlarge', displayName: 'm6i.2xlarge', family: 'General purpose', regionAvailability: awsRegions, vcpu: 8, memoryMiB: 32768, hourlyCost: 0.384, currency: 'USD', defaultMaxPods: 58 },
  { provider: 'aws', sku: 'r6i.xlarge', displayName: 'r6i.xlarge', family: 'Memory optimized', regionAvailability: awsRegions, vcpu: 4, memoryMiB: 32768, hourlyCost: 0.252, currency: 'USD', defaultMaxPods: 58 },
]
