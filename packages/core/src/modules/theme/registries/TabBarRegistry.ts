/**
 * Tab Bar Registry
 *
 * Manages tab bar configurations and variants.
 */

import { ITabBarConfig, ITabBarStyle, TabBarVariant } from '../types'

/**
 * Tab Bar Registry Interface
 */
export interface ITabBarRegistry {
  // Configuration
  setConfig(config: ITabBarConfig): void
  getConfig(): ITabBarConfig

  // Variants
  setVariant(variant: TabBarVariant): void
  getVariant(): TabBarVariant
  getVariantStyle(variant: TabBarVariant): ITabBarStyle | undefined
  listVariants(): TabBarVariant[]

  // Active style
  getActiveStyle(): ITabBarStyle
}

/**
 * Create default tab bar style
 */
function createDefaultStyle(): ITabBarStyle {
  return {
    position: 'relative',
    height: 80,
    backgroundColor: '#313132',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
  }
}

/**
 * Create floating tab bar style
 */
function createFloatingStyle(): ITabBarStyle {
  return {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0D2828',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    shadowOpacity: 0.3,
    elevation: 8,
  }
}

/**
 * Create minimal tab bar style
 */
function createMinimalStyle(): ITabBarStyle {
  return {
    position: 'relative',
    height: 56,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#66666640',
  }
}

/**
 * Create attached tab bar style
 */
function createAttachedStyle(): ITabBarStyle {
  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#313132E6',
    borderTopWidth: 0,
  }
}

/**
 * Create default tab bar configuration
 */
function createDefaultConfig(): ITabBarConfig {
  return {
    variant: 'default',
    variants: {
      default: createDefaultStyle(),
      floating: createFloatingStyle(),
      minimal: createMinimalStyle(),
      attached: createAttachedStyle(),
    },
    style: createDefaultStyle(),
    tabItem: {
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
      },
      text: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
      },
      icon: {
        size: 24,
      },
    },
    colors: {
      activeTintColor: '#FFFFFF',
      inactiveTintColor: '#FFFFFF66',
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
    tabs: [
      {
        id: 'home',
        label: 'Home',
        labelKey: 'TabStack.Home',
        icon: 'home',
        showBadge: true,
      },
      {
        id: 'credentials',
        label: 'Credentials',
        labelKey: 'TabStack.Credentials',
        icon: 'wallet',
      },
      {
        id: 'settings',
        label: 'Settings',
        labelKey: 'TabStack.Settings',
        icon: 'settings',
      },
    ],
  }
}

/**
 * Tab Bar Registry Implementation
 */
export class TabBarRegistry implements ITabBarRegistry {
  private config: ITabBarConfig

  constructor() {
    this.config = createDefaultConfig()
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  setConfig(config: ITabBarConfig): void {
    this.config = config

    // Ensure style matches variant
    if (config.variants && config.variant && config.variants[config.variant]) {
      this.config.style = config.variants[config.variant]
    }
  }

  getConfig(): ITabBarConfig {
    return this.config
  }

  // ============================================================================
  // VARIANTS
  // ============================================================================

  setVariant(variant: TabBarVariant): void {
    this.config.variant = variant

    if (this.config.variants && this.config.variants[variant]) {
      this.config.style = this.config.variants[variant]
    }
  }

  getVariant(): TabBarVariant {
    return this.config.variant
  }

  getVariantStyle(variant: TabBarVariant): ITabBarStyle | undefined {
    return this.config.variants?.[variant]
  }

  listVariants(): TabBarVariant[] {
    if (this.config.variants) {
      return Object.keys(this.config.variants) as TabBarVariant[]
    }
    return ['default']
  }

  // ============================================================================
  // ACTIVE STYLE
  // ============================================================================

  getActiveStyle(): ITabBarStyle {
    return this.config.style
  }
}

/**
 * Factory function
 */
export function createTabBarRegistry(): ITabBarRegistry {
  return new TabBarRegistry()
}
