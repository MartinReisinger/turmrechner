export interface StoragePort {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function readStorage(key: string, storage?: StoragePort): unknown {
  try {
    return JSON.parse((storage ?? localStorage).getItem(key) ?? 'null')
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: unknown, storage?: StoragePort): boolean {
  try {
    ;(storage ?? localStorage).setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function clearStorage(keys: readonly string[], storage?: Pick<Storage, 'removeItem'>): boolean {
  try {
    for (const key of keys) (storage ?? localStorage).removeItem(key)
    return true
  } catch {
    return false
  }
}
