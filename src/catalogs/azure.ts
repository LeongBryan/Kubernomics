import type { NodeShapeCatalogEntry } from './providers'

const azureRegions = ['southeastasia', 'eastasia', 'westeurope', 'eastus', 'westus']

// Azure Retail Prices API, USD, Linux pay-as-you-go. Region-specific pricing is TODO.
export const azureCatalog: NodeShapeCatalogEntry[] = [
  { provider: 'azure', sku: 'Standard_B2ms', displayName: 'Standard_B2ms', family: 'Burstable', regionAvailability: azureRegions, vcpu: 2, memoryMiB: 8192, hourlyCost: 0.106, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 100, reservedMemoryMiB: 2148 },
  { provider: 'azure', sku: 'Standard_B8ms', displayName: 'Standard_B8ms', family: 'Burstable', regionAvailability: azureRegions, vcpu: 8, memoryMiB: 32768, hourlyCost: 0.422, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 180, reservedMemoryMiB: 2350 },
  { provider: 'azure', sku: 'Standard_D2ds_v5', displayName: 'Standard_D2ds_v5', family: 'General purpose', regionAvailability: azureRegions, vcpu: 2, memoryMiB: 8192, hourlyCost: 0.142, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 100, reservedMemoryMiB: 1792 },
  { provider: 'azure', sku: 'Standard_D4ds_v4', displayName: 'Standard_D4ds_v4', family: 'General purpose', regionAvailability: azureRegions, vcpu: 4, memoryMiB: 16384, hourlyCost: 0.282, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 140, reservedMemoryMiB: 2350 },
  { provider: 'azure', sku: 'Standard_D4ds_v5', displayName: 'Standard_D4ds_v5', family: 'General purpose', regionAvailability: azureRegions, vcpu: 4, memoryMiB: 16384, hourlyCost: 0.282, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 140, reservedMemoryMiB: 2350 },
  { provider: 'azure', sku: 'Standard_D8ds_v5', displayName: 'Standard_D8ds_v5', family: 'General purpose', regionAvailability: azureRegions, vcpu: 8, memoryMiB: 32768, hourlyCost: 0.54, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 300, reservedMemoryMiB: 2560 },
  { provider: 'azure', sku: 'Standard_D16ds_v5', displayName: 'Standard_D16ds_v5', family: 'General purpose', regionAvailability: azureRegions, vcpu: 16, memoryMiB: 65536, hourlyCost: 1.08, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 400, reservedMemoryMiB: 3072 },
  { provider: 'azure', sku: 'Standard_D4s_v4', displayName: 'Standard_D4s_v4', family: 'General purpose', regionAvailability: azureRegions, vcpu: 4, memoryMiB: 16384, hourlyCost: 0.24, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 140, reservedMemoryMiB: 2350 },
  { provider: 'azure', sku: 'Standard_D2as_v5', displayName: 'Standard_D2as_v5', family: 'General purpose AMD', regionAvailability: azureRegions, vcpu: 2, memoryMiB: 8192, hourlyCost: 0.096, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 100, reservedMemoryMiB: 1792 },
  { provider: 'azure', sku: 'Standard_D4as_v5', displayName: 'Standard_D4as_v5', family: 'General purpose AMD', regionAvailability: azureRegions, vcpu: 4, memoryMiB: 16384, hourlyCost: 0.192, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 140, reservedMemoryMiB: 2350 },
  { provider: 'azure', sku: 'Standard_D8as_v5', displayName: 'Standard_D8as_v5', family: 'General purpose AMD', regionAvailability: azureRegions, vcpu: 8, memoryMiB: 32768, hourlyCost: 0.384, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 300, reservedMemoryMiB: 2560 },
  { provider: 'azure', sku: 'Standard_E4ads_v5', displayName: 'Standard_E4ads_v5', family: 'Memory optimized', regionAvailability: azureRegions, vcpu: 4, memoryMiB: 32768, hourlyCost: 0.318, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 140, reservedMemoryMiB: 2350 },
  { provider: 'azure', sku: 'Standard_E8ads_v5', displayName: 'Standard_E8ads_v5', family: 'Memory optimized', regionAvailability: azureRegions, vcpu: 8, memoryMiB: 65536, hourlyCost: 0.636, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 300, reservedMemoryMiB: 2560 },
  { provider: 'azure', sku: 'Standard_F4s_v2', displayName: 'Standard_F4s_v2', family: 'Compute optimized', regionAvailability: azureRegions, vcpu: 4, memoryMiB: 8192, hourlyCost: 0.199, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 140, reservedMemoryMiB: 1792 },
  { provider: 'azure', sku: 'Standard_F8s_v2', displayName: 'Standard_F8s_v2', family: 'Compute optimized', regionAvailability: azureRegions, vcpu: 8, memoryMiB: 16384, hourlyCost: 0.398, currency: 'USD', defaultMaxPods: 110, reservedCPUm: 300, reservedMemoryMiB: 2350 },
]
