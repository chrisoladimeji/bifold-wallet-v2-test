/**
 * Theme Module
 *
 * Modular theming system for Bifold Wallet.
 * Provides YAML-based theme configuration with registries for:
 * - Card themes (per-issuer credential styling)
 * - Backgrounds (screen backgrounds)
 * - Tab bars (navigation tab bar variants)
 *
 * @example
 * ```tsx
 * import {
 *   ThemeRegistry,
 *   ThemeRegistryProvider,
 *   useCardTheme,
 *   useScreenBackground,
 *   useTabBarTheme,
 *   ThemedBackground,
 *   ThemedTabBar,
 * } from '@bifold/core/modules/theme'
 * ```
 */

// Types
export * from './types'

// Registries
export {
  ThemeRegistry,
  createThemeRegistry,
  type IThemeRegistry,
} from './registries/ThemeRegistry'

export {
  CardThemeRegistry,
  createCardThemeRegistry,
  type ICardThemeRegistry,
} from './registries/CardThemeRegistry'

export {
  BackgroundRegistry,
  createBackgroundRegistry,
  type IBackgroundRegistry,
} from './registries/BackgroundRegistry'

export {
  TabBarRegistry,
  createTabBarRegistry,
  type ITabBarRegistry,
} from './registries/TabBarRegistry'

// Context (separate file to avoid circular imports)
export { ThemeRegistryContext } from './contexts/ThemeRegistryContext'

// Hooks
export {
  useThemeRegistry,
  useOptionalThemeRegistry,
} from './hooks/useThemeRegistry'

export {
  useCardTheme,
  useCardThemeById,
  useCardThemes,
} from './hooks/useCardTheme'

export {
  useScreenBackground,
  useBackgroundById,
  useBackgrounds,
} from './hooks/useScreenBackground'

export {
  useTabBarTheme,
  useTabBarStyle,
  useTabBarVariant,
  useTabBarVariants,
} from './hooks/useTabBarTheme'

// Providers
export {
  ThemeRegistryProvider,
  type ThemeRegistryProviderProps,
} from './providers/ThemeRegistryProvider'

// Components
export {
  ThemedBackground,
  type ThemedBackgroundProps,
} from './components/ThemedBackground'

export {
  ThemedTabBar,
  type ThemedTabBarProps,
} from './components/ThemedTabBar'

// Utilities
export { deepMerge, deepMergeAll } from './utils/deepMerge'
export {
  hexToRgb,
  rgbToHex,
  addOpacity,
  lighten,
  darken,
  isDark,
  getContrastColor,
  parseColorWithOpacity,
} from './utils/colorUtils'
export type { DeepPartial } from './utils/types'

// Loaders
export {
  resolveVariables,
  loadThemeBundle,
  createVariableContext,
  parseYamlTheme,
  validateThemeManifest,
  type IVariableContext,
  type IThemeBundle,
} from './loaders/themeLoader'

// Pre-built Themes
export {
  tealDarkTheme,
  tealDarkColorPalette,
  TealDarkTheme,
  THEME_IDS,
  type ThemeId,
} from './themes'
