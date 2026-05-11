import type { NodeShapeCatalogEntry } from './providers'

export const customCatalog: NodeShapeCatalogEntry[] = [
  {
    provider: 'custom',
    sku: 'custom-node',
    displayName: 'Custom node',
    family: 'Manual',
    regionAvailability: ['custom'],
    vcpu: 4,
    memoryMiB: 16384,
    hourlyCost: undefined,
    currency: 'USD',
    defaultMaxPods: 110,
  },
]
