/**
 * Theme Registry
 *
 * Central registry for managing theme manifests and building resolved themes.
 * Follows the same patterns as WorkflowRegistry.
 */

import {
  IThemeManifest,
  IResolvedTheme,
  IThemeInfo,
  ITabBarConfig,
  IBackgroundConfig,
  IScreenBackgrounds,
  ICardTheme,
} from '../types'
import { CardThemeRegistry, ICardThemeRegistry } from './CardThemeRegistry'
import { BackgroundRegistry, IBackgroundRegistry } from './BackgroundRegistry'
import { TabBarRegistry, ITabBarRegistry } from './TabBarRegistry'

/**
 * Theme Registry Interface
 */
export interface IThemeRegistry {
  // Registration
  register(manifest: IThemeManifest): void
  registerMultiple(manifests: IThemeManifest[]): void
  unregister(id: string): void

  // Retrieval
  get(id: string): IResolvedTheme | undefined
  getManifest(id: string): IThemeManifest | undefined
  list(): IThemeInfo[]
  has(id: string): boolean

  // Active theme management
  setActive(id: string): void
  getActive(): IResolvedTheme | undefined
  getActiveId(): string | undefined

  // Sub-registries
  getCardThemeRegistry(): ICardThemeRegistry
  getBackgroundRegistry(): IBackgroundRegistry
  getTabBarRegistry(): ITabBarRegistry

  // Configuration injection
  setCardThemes(themes: ICardTheme[]): void
  setBackgrounds(backgrounds: IBackgroundConfig[]): void
  setScreenBackgrounds(mapping: IScreenBackgrounds): void
  setTabBarConfig(config: ITabBarConfig): void
}

/**
 * Default tab bar configuration
 */
const createDefaultTabBarConfig = (): ITabBarConfig => ({
  variant: 'default',
  style: {
    height: 80,
    backgroundColor: '#313132',
    paddingBottom: 20,
  },
  tabItem: {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    icon: {
      size: 24,
    },
  },
  colors: {
    activeTintColor: '#FFFFFF',
    inactiveTintColor: '#666666',
    activeBackgroundColor: 'transparent',
    inactiveBackgroundColor: 'transparent',
  },
  badge: {
    backgroundColor: '#EF4444',
    textColor: '#FFFFFF',
    size: 18,
    fontSize: 11,
    fontWeight: 'bold',
    borderRadius: 9,
    minWidth: 18,
    position: { top: -2, right: -6 },
  },
  tabs: [],
})

/**
 * Theme Registry Implementation
 */
export class ThemeRegistry implements IThemeRegistry {
  private manifests: Map<string, IThemeManifest> = new Map()
  private builtThemes: Map<string, IResolvedTheme> = new Map()
  private activeThemeId?: string

  // Sub-registries
  private cardThemeRegistry: CardThemeRegistry
  private backgroundRegistry: BackgroundRegistry
  private tabBarRegistry: TabBarRegistry

  constructor() {
    this.cardThemeRegistry = new CardThemeRegistry()
    this.backgroundRegistry = new BackgroundRegistry()
    this.tabBarRegistry = new TabBarRegistry()
  }

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  register(manifest: IThemeManifest): void {
    this.manifests.set(manifest.meta.id, manifest)
    // Invalidate cache
    this.builtThemes.delete(manifest.meta.id)

    // Set as active if it's the first theme
    if (!this.activeThemeId) {
      this.activeThemeId = manifest.meta.id
    }
  }

  registerMultiple(manifests: IThemeManifest[]): void {
    manifests.forEach((m) => this.register(m))
  }

  unregister(id: string): void {
    this.manifests.delete(id)
    this.builtThemes.delete(id)

    // Clear active if it was unregistered
    if (this.activeThemeId === id) {
      this.activeThemeId = undefined
    }
  }

  // ============================================================================
  // RETRIEVAL
  // ============================================================================

  get(id: string): IResolvedTheme | undefined {
    if (!this.manifests.has(id)) {
      return undefined
    }
    return this.build(id)
  }

  getManifest(id: string): IThemeManifest | undefined {
    return this.manifests.get(id)
  }

  list(): IThemeInfo[] {
    return Array.from(this.manifests.values()).map((m) => ({
      id: m.meta.id,
      name: m.meta.name,
      version: m.meta.version,
      description: m.meta.description,
    }))
  }

  has(id: string): boolean {
    return this.manifests.has(id)
  }

  // ============================================================================
  // ACTIVE THEME
  // ============================================================================

  setActive(id: string): void {
    if (!this.manifests.has(id)) {
      return
    }
    this.activeThemeId = id

    // Build and update sub-registries
    const resolved = this.build(id)
    if (resolved) {
      this.updateSubRegistries(resolved)
    }
  }

  getActive(): IResolvedTheme | undefined {
    if (!this.activeThemeId) {
      return undefined
    }
    return this.build(this.activeThemeId)
  }

  getActiveId(): string | undefined {
    return this.activeThemeId
  }

  // ============================================================================
  // BUILDING
  // ============================================================================

  private build(manifestId: string): IResolvedTheme | undefined {
    // Check cache
    if (this.builtThemes.has(manifestId)) {
      return this.builtThemes.get(manifestId)!
    }

    const manifest = this.manifests.get(manifestId)
    if (!manifest) {
      return undefined
    }

    // Create resolved theme
    const resolved: IResolvedTheme = {
      id: manifest.meta.id,
      name: manifest.meta.name,
      manifest,
      cardThemes: [],
      backgrounds: [],
      screenBackgrounds: {},
      tabBarConfig: createDefaultTabBarConfig(),
      screenThemes: new Map(),
    }

    // Cache
    this.builtThemes.set(manifestId, resolved)

    return resolved
  }

  // ============================================================================
  // SUB-REGISTRIES
  // ============================================================================

  getCardThemeRegistry(): ICardThemeRegistry {
    return this.cardThemeRegistry
  }

  getBackgroundRegistry(): IBackgroundRegistry {
    return this.backgroundRegistry
  }

  getTabBarRegistry(): ITabBarRegistry {
    return this.tabBarRegistry
  }

  // ============================================================================
  // CONFIGURATION INJECTION
  // ============================================================================

  setCardThemes(themes: ICardTheme[]): void {
    this.cardThemeRegistry.clear()
    themes.forEach((t) => this.cardThemeRegistry.register(t))

    // Update active resolved theme
    if (this.activeThemeId && this.builtThemes.has(this.activeThemeId)) {
      const resolved = this.builtThemes.get(this.activeThemeId)!
      resolved.cardThemes = themes
    }
  }

  setBackgrounds(backgrounds: IBackgroundConfig[]): void {
    this.backgroundRegistry.clear()
    backgrounds.forEach((b) => this.backgroundRegistry.register(b))

    // Build screen mapping from screenIds in each background config
    const screenMapping: IScreenBackgrounds = {}
    backgrounds.forEach((bg) => {
      if (bg.screenIds) {
        bg.screenIds.forEach((screenId) => {
          if (screenId !== '*') {
            screenMapping[screenId] = bg.id
          }
        })
      }
    })
    this.backgroundRegistry.setScreenMapping(screenMapping)

    // Update active resolved theme
    if (this.activeThemeId && this.builtThemes.has(this.activeThemeId)) {
      const resolved = this.builtThemes.get(this.activeThemeId)!
      resolved.backgrounds = backgrounds
      resolved.screenBackgrounds = screenMapping
    }
  }

  setScreenBackgrounds(mapping: IScreenBackgrounds): void {
    this.backgroundRegistry.setScreenMapping(mapping)

    // Update active resolved theme
    if (this.activeThemeId && this.builtThemes.has(this.activeThemeId)) {
      const resolved = this.builtThemes.get(this.activeThemeId)!
      resolved.screenBackgrounds = mapping
    }
  }

  setTabBarConfig(config: ITabBarConfig): void {
    this.tabBarRegistry.setConfig(config)

    // Update active resolved theme
    if (this.activeThemeId && this.builtThemes.has(this.activeThemeId)) {
      const resolved = this.builtThemes.get(this.activeThemeId)!
      resolved.tabBarConfig = config
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private updateSubRegistries(resolved: IResolvedTheme): void {
    // Update card themes
    if (resolved.cardThemes.length > 0) {
      this.cardThemeRegistry.clear()
      resolved.cardThemes.forEach((t) => this.cardThemeRegistry.register(t))
    }

    // Update backgrounds
    if (resolved.backgrounds.length > 0) {
      this.backgroundRegistry.clear()
      resolved.backgrounds.forEach((b) => this.backgroundRegistry.register(b))
    }

    // Update screen backgrounds
    if (Object.keys(resolved.screenBackgrounds).length > 0) {
      this.backgroundRegistry.setScreenMapping(resolved.screenBackgrounds)
    }

    // Update tab bar
    if (resolved.tabBarConfig) {
      this.tabBarRegistry.setConfig(resolved.tabBarConfig)
    }
  }
}

/**
 * Factory function to create a ThemeRegistry
 */
export function createThemeRegistry(): IThemeRegistry {
  return new ThemeRegistry()
}
