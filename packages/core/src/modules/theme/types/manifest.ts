/**
 * Theme Manifest Types
 *
 * Defines the structure of theme manifest files (YAML configuration).
 */

import { DeepPartial } from '../utils/types'
import { ITabBarConfig, IBackgroundConfig, IScreenBackgrounds } from './navigation'
import { ICardTheme } from './workflows'
import { IScreenTheme } from './screens'

/**
 * Theme metadata
 */
export interface IThemeMeta {
  /** Unique identifier for the theme */
  id: string
  /** Display name */
  name: string
  /** Semantic version */
  version: string
  /** Description */
  description?: string
  /** Author/organization */
  author?: string
  /** Parent theme ID to extend from */
  extends?: string | null
}

/**
 * Feature flags that can be enabled/disabled per theme
 */
export interface IThemeFeatures {
  /** Use the new separated PIN input design */
  useNewPINDesign?: boolean
  /** Enable gradient backgrounds on screens */
  enableGradientBackgrounds?: boolean
  /** Tab bar variant to use */
  tabBarVariant?: 'default' | 'floating' | 'minimal' | 'attached'
  /** Show menu button in chat header */
  showMenuButtonInChat?: boolean
  /** Enable shadows on credential cards */
  enableCardShadows?: boolean
  /** Custom feature flags */
  [key: string]: boolean | string | undefined
}

/**
 * Import paths for theme components
 */
export interface IThemeImports {
  /** Path to colors YAML */
  colors?: string
  /** Path to typography YAML */
  typography?: string
  /** Path to spacing YAML */
  spacing?: string
  /** Glob pattern for component themes */
  components?: string
  /** Glob pattern for screen themes */
  screens?: string
  /** Glob pattern for navigation themes */
  navigation?: string
  /** Glob pattern for workflow themes */
  workflows?: string
  /** Parent theme to extend */
  extendsTheme?: string
  /** Color palette source */
  colorPalette?: string | 'embedded'
}

/**
 * Theme manifest - the root configuration for a theme package
 */
export interface IThemeManifest {
  /** Theme metadata */
  meta: IThemeMeta
  /** Feature flags */
  features: IThemeFeatures
  /** Import paths for sub-configurations */
  imports?: IThemeImports
  /** Direct overrides to the base theme */
  overrides?: DeepPartial<Record<string, unknown>>
}

/**
 * Resolved theme - a fully built theme with all sub-configurations
 */
export interface IResolvedTheme {
  /** Theme ID */
  id: string
  /** Theme name */
  name: string
  /** Original manifest */
  manifest: IThemeManifest
  /** Card themes for credential rendering */
  cardThemes: ICardTheme[]
  /** Background configurations */
  backgrounds: IBackgroundConfig[]
  /** Screen-to-background mapping */
  screenBackgrounds: IScreenBackgrounds
  /** Tab bar configuration */
  tabBarConfig: ITabBarConfig
  /** Screen-specific themes */
  screenThemes: Map<string, IScreenTheme>
}

/**
 * Theme registration info (minimal data for listing)
 */
export interface IThemeInfo {
  id: string
  name: string
  version: string
  description?: string
}
