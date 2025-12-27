/**
 * Deep Merge Utility
 *
 * Deeply merges objects, handling arrays and special cases.
 */

import { DeepPartial } from './types'

/**
 * Check if value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Deep merge two objects
 *
 * @param target - Base object
 * @param source - Object to merge into target
 * @returns Merged object
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: DeepPartial<T>
): T {
  const result = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (sourceValue === undefined) {
        // Explicitly set undefined to allow clearing values
        (result as Record<string, unknown>)[key] = undefined
      } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        // Recursively merge objects
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as DeepPartial<Record<string, unknown>>
        )
      } else if (Array.isArray(sourceValue)) {
        // Replace arrays entirely
        (result as Record<string, unknown>)[key] = [...sourceValue]
      } else {
        // Replace primitive values
        (result as Record<string, unknown>)[key] = sourceValue
      }
    }
  }

  return result
}

/**
 * Deep merge multiple objects
 *
 * @param target - Base object
 * @param sources - Objects to merge
 * @returns Merged object
 */
export function deepMergeAll<T extends Record<string, unknown>>(
  target: T,
  ...sources: DeepPartial<T>[]
): T {
  return sources.reduce((acc, source) => deepMerge(acc, source), target)
}
