/**
 * Theme Loader
 *
 * Utilities for loading and resolving theme configurations.
 * Supports variable interpolation and theme inheritance.
 */

import { IThemeManifest } from '../types/manifest'
import { ICardTheme } from '../types/workflows'
import { IBackgroundConfig, ITabBarConfig } from '../types'

/**
 * Variable resolution context
 */
export interface IVariableContext {
  colorPalette?: Record<string, Record<string, string>>
  [key: string]: unknown
}

/**
 * Theme bundle containing all loaded theme assets
 */
export interface IThemeBundle {
  manifest: IThemeManifest
  cardThemes: ICardTheme[]
  backgrounds: IBackgroundConfig[]
  tabBar: ITabBarConfig
}

/**
 * Resolve variable references in a value
 * Supports ${colorPalette.brand.primary} style references
 */
export function resolveVariables(value: unknown, context: IVariableContext): unknown {
  if (typeof value === 'string') {
    // Match ${path.to.value} patterns
    const variablePattern = /\$\{([^}]+)\}/g
    return value.replace(variablePattern, (_, path) => {
      const parts = path.split('.')
      let result: unknown = context
      for (const part of parts) {
        if (result && typeof result === 'object' && part in result) {
          result = (result as Record<string, unknown>)[part]
        } else {
          return `\${${path}}`
        }
      }
      return String(result)
    })
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveVariables(item, context))
  }

  if (value && typeof value === 'object') {
    const resolved: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveVariables(val, context)
    }
    return resolved
  }

  return value
}

/**
 * Load a theme bundle from JSON config
 */
export function loadThemeBundle(
  config: Record<string, unknown>,
  variableContext?: IVariableContext
): IThemeBundle {
  // Resolve all variables in the config
  const resolved = variableContext
    ? (resolveVariables(config, variableContext) as Record<string, unknown>)
    : config

  return {
    manifest: resolved.manifest as IThemeManifest,
    cardThemes: (resolved.cardThemes as ICardTheme[]) || [],
    backgrounds: (resolved.backgrounds as IBackgroundConfig[]) || [],
    tabBar: resolved.tabBar as ITabBarConfig,
  }
}

/**
 * Create a variable context from color palette
 */
export function createVariableContext(
  colorPalette: Record<string, Record<string, string>>
): IVariableContext {
  return {
    colorPalette,
  }
}

/**
 * Parse YAML theme content (requires yaml package at build time)
 * For runtime, use pre-converted JSON
 */
export async function parseYamlTheme(yamlContent: string): Promise<Record<string, unknown>> {
  // Dynamic import to avoid bundling yaml parser if not needed
  try {
    const yaml = await import('yaml')
    return yaml.parse(yamlContent) as Record<string, unknown>
  } catch {
    throw new Error('YAML parsing not available. Use pre-converted JSON themes.')
  }
}

/**
 * Validate theme manifest structure
 */
export function validateThemeManifest(manifest: unknown): manifest is IThemeManifest {
  if (!manifest || typeof manifest !== 'object') {
    return false
  }

  const m = manifest as Record<string, unknown>

  // Required fields
  if (!m.meta || typeof m.meta !== 'object') return false
  if (!m.features || typeof m.features !== 'object') return false

  const meta = m.meta as Record<string, unknown>
  if (typeof meta.id !== 'string') return false
  if (typeof meta.name !== 'string') return false
  if (typeof meta.version !== 'string') return false

  return true
}

export default {
  resolveVariables,
  loadThemeBundle,
  createVariableContext,
  parseYamlTheme,
  validateThemeManifest,
}
