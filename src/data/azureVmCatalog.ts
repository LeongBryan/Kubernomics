import type { NodePool } from '../core/simulator'
import { azureCatalog } from '../catalogs/azure'
import { nodeShapePatch } from '../catalogs/providers'

type AzureVmShape = {
  shape: string
  vcpu: number
  memoryGiB: number
  hourlyCost: number
  reservedCPUm: number
  reservedMemoryMiB: number
}

// Azure Retail Prices API, USD, southeastasia, Linux pay-as-you-go.
export const azureVmShapes: AzureVmShape[] = [
  ...azureCatalog.map((shape) => ({
    shape: shape.sku,
    vcpu: shape.vcpu,
    memoryGiB: shape.memoryMiB / 1024,
    hourlyCost: shape.hourlyCost ?? 0,
    reservedCPUm: shape.reservedCPUm ?? 0,
    reservedMemoryMiB: shape.reservedMemoryMiB ?? 0,
  })),
]

export function findAzureVmShape(shape: string): AzureVmShape {
  return azureVmShapes.find((item) => item.shape === shape) ?? azureVmShapes[0]
}

export function nodePoolShapePatch(shapeName: string): Pick<NodePool, 'shape' | 'hourlyCost' | 'systemReserved' | 'kubeReserved'> {
  const entry = azureCatalog.find((item) => item.sku === shapeName) ?? azureCatalog[0]
  return nodeShapePatch(entry, 'southeastasia')
}
