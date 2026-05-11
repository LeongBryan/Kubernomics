let counter = 0
export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++counter}`
}
