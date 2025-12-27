/**
 * Background Registry
 *
 * Manages background configurations for screens.
 */

import { IBackgroundConfig, IScreenBackgrounds } from '../types'

/**
 * Background Registry Interface
 */
export interface IBackgroundRegistry {
  // Registration
  register(config: IBackgroundConfig): void
  unregister(id: string): void
  clear(): void

  // Retrieval
  get(id: string): IBackgroundConfig | undefined
  getForScreen(screenId: string): IBackgroundConfig
  getDefault(): IBackgroundConfig
  list(): IBackgroundConfig[]

  // Screen mapping
  setScreenMapping(mapping: IScreenBackgrounds): void
  getScreenMapping(): IScreenBackgrounds

  // Configuration
  setDefault(config: IBackgroundConfig): void
}

/**
 * Create default background configuration
 */
function createDefaultBackground(): IBackgroundConfig {
  return {
    id: 'default',
    type: 'solid',
    color: '#000000',
  }
}

/**
 * Background Registry Implementation
 */
export class BackgroundRegistry implements IBackgroundRegistry {
  private backgrounds: Map<string, IBackgroundConfig> = new Map()
  private screenMapping: IScreenBackgrounds = {}
  private defaultBackground: IBackgroundConfig

  constructor() {
    this.defaultBackground = createDefaultBackground()
    // Register default
    this.backgrounds.set('default', this.defaultBackground)
  }

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  register(config: IBackgroundConfig): void {
    this.backgrounds.set(config.id, config)
  }

  unregister(id: string): void {
    if (id !== 'default') {
      this.backgrounds.delete(id)
    }
  }

  clear(): void {
    this.backgrounds.clear()
    this.screenMapping = {}
    this.defaultBackground = createDefaultBackground()
    this.backgrounds.set('default', this.defaultBackground)
  }

  // ============================================================================
  // RETRIEVAL
  // ============================================================================

  get(id: string): IBackgroundConfig | undefined {
    return this.backgrounds.get(id)
  }

  getForScreen(screenId: string): IBackgroundConfig {
    const backgroundId = this.screenMapping[screenId]
    if (backgroundId) {
      const bg = this.backgrounds.get(backgroundId)
      if (bg) return bg
    }
    return this.defaultBackground
  }

  getDefault(): IBackgroundConfig {
    return this.defaultBackground
  }

  list(): IBackgroundConfig[] {
    return Array.from(this.backgrounds.values())
  }

  // ============================================================================
  // SCREEN MAPPING
  // ============================================================================

  setScreenMapping(mapping: IScreenBackgrounds): void {
    this.screenMapping = { ...mapping }
  }

  getScreenMapping(): IScreenBackgrounds {
    return { ...this.screenMapping }
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  setDefault(config: IBackgroundConfig): void {
    this.defaultBackground = config
    this.backgrounds.set('default', config)
  }
}

/**
 * Factory function
 */
export function createBackgroundRegistry(): IBackgroundRegistry {
  return new BackgroundRegistry()
}
