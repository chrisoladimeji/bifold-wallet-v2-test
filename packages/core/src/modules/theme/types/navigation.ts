/**
 * Navigation Theme Types
 *
 * Tab bar, header, and background configurations.
 */

import { TextStyle, ViewStyle } from 'react-native'

// ============================================================================
// TAB BAR
// ============================================================================

/**
 * Tab bar variant types
 */
export type TabBarVariant = 'default' | 'floating' | 'minimal' | 'attached'

/**
 * Tab definition
 */
export interface ITabDefinition {
  /** Unique tab identifier */
  id: string
  /** Display label */
  label: string
  /** i18n key for label */
  labelKey?: string
  /** Icon name (from Assets) - optional for themes that use navigator-defined icons */
  icon?: string
  /** Active/focused icon name */
  activeIcon?: string
  /** Whether to show badge on this tab */
  showBadge?: boolean
  /** State key for badge count */
  badgeKey?: string
}

/**
 * Tab bar style configuration
 */
export interface ITabBarStyle {
  /** Position type */
  position?: 'relative' | 'absolute'
  /** Bottom offset (for floating) */
  bottom?: number
  /** Left offset (for floating) */
  left?: number
  /** Right offset (for floating) */
  right?: number
  /** Tab bar height */
  height: number
  /** Border radius (for floating) */
  borderRadius?: number
  /** Background color */
  backgroundColor: string
  /** Horizontal padding */
  paddingHorizontal?: number
  /** Vertical padding */
  paddingVertical?: number
  /** Bottom padding (safe area) */
  paddingBottom?: number
  /** Top padding */
  paddingTop?: number
  /** Border top width */
  borderTopWidth?: number
  /** Border top color */
  borderTopColor?: string
  /** Shadow color */
  shadowColor?: string
  /** Shadow offset */
  shadowOffset?: { width: number; height: number }
  /** Shadow radius */
  shadowRadius?: number
  /** Shadow opacity */
  shadowOpacity?: number
  /** Android elevation */
  elevation?: number
  /** Blur effect (iOS) */
  backdropFilter?: string
}

/**
 * Tab item styling
 */
export interface ITabItemStyle {
  /** Container style */
  container: {
    flex?: number
    justifyContent?: ViewStyle['justifyContent']
    alignItems?: ViewStyle['alignItems']
    paddingVertical?: number
    paddingHorizontal?: number
  }
  /** Text style */
  text: {
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    marginTop?: number
  }
  /** Icon configuration */
  icon: {
    size: number
    marginBottom?: number
  }
  /** Active indicator (pill style) */
  activeIndicator?: {
    enabled: boolean
    style: {
      width: number
      height: number
      borderRadius: number
      backgroundColor: string
    }
  }
}

/**
 * Badge styling
 */
export interface ITabBadgeStyle {
  /** Background color */
  backgroundColor: string
  /** Text color */
  textColor: string
  /** Badge size */
  size: number
  /** Font size */
  fontSize: number
  /** Font weight */
  fontWeight: TextStyle['fontWeight']
  /** Border radius */
  borderRadius: number
  /** Minimum width */
  minWidth: number
  /** Position offset */
  position: {
    top: number
    right: number
  }
}

/**
 * Tab bar colors
 */
export interface ITabBarColors {
  /** Active tab tint */
  activeTintColor: string
  /** Inactive tab tint */
  inactiveTintColor: string
  /** Active tab background */
  activeBackgroundColor: string
  /** Inactive tab background */
  inactiveBackgroundColor: string
}

/**
 * Complete tab bar configuration
 */
export interface ITabBarConfig {
  /** Active variant */
  variant: TabBarVariant
  /** All variant styles */
  variants?: Record<TabBarVariant, ITabBarStyle>
  /** Current style (resolved from variant) */
  style: ITabBarStyle
  /** Tab item styling */
  tabItem: ITabItemStyle
  /** Colors */
  colors: ITabBarColors
  /** Badge styling */
  badge: ITabBadgeStyle
  /** Tab definitions */
  tabs: ITabDefinition[]
}

// ============================================================================
// BACKGROUNDS
// ============================================================================

/**
 * Background type
 */
export type BackgroundType = 'solid' | 'gradient' | 'image'

/**
 * Gradient type
 */
export type GradientType = 'linear' | 'radial'

/**
 * Gradient configuration
 */
export interface IGradientConfig {
  /** Gradient type */
  type: GradientType
  /** Color stops */
  colors: string[]
  /** Start point (linear) */
  start?: { x: number; y: number }
  /** End point (linear) */
  end?: { x: number; y: number }
  /** Center point (radial) */
  center?: { x: number; y: number }
  /** Radius (radial) */
  radius?: number
  /** Color stop locations */
  locations?: number[]
}

/**
 * Background configuration
 */
export interface IBackgroundConfig {
  /** Unique identifier */
  id: string
  /** Background type */
  type: BackgroundType
  /** Solid color (for type: 'solid') */
  color?: string
  /** Gradient config (for type: 'gradient') */
  gradient?: IGradientConfig
  /** Image source (for type: 'image') */
  source?: string
  /** Image resize mode */
  resizeMode?: 'cover' | 'contain' | 'stretch'
  /** Background opacity */
  opacity?: number
  /** Overlay (another background config) */
  overlay?: Omit<IBackgroundConfig, 'id' | 'overlay'>
  /** Screen IDs this background applies to (use '*' for default) */
  screenIds?: string[]
}

/**
 * Screen to background mapping
 */
export interface IScreenBackgrounds {
  [screenId: string]: string // Maps to background ID
}

// ============================================================================
// HEADERS
// ============================================================================

/**
 * Header icon configuration
 */
export interface IHeaderIcon {
  /** Icon component name */
  component: string
  /** Icon size */
  size: number
  /** Icon color */
  color: string
  /** Touchable area size */
  touchableSize?: number
  /** Background color */
  backgroundColor?: string
  /** Border radius */
  borderRadius?: number
}

/**
 * Header configuration
 */
export interface IHeaderConfig {
  /** Container style */
  container?: {
    height?: number
    paddingHorizontal?: number
    paddingTop?: number
    paddingBottom?: number
    backgroundColor?: string
  }
  /** Title style */
  title?: {
    fontSize?: number
    fontWeight?: TextStyle['fontWeight']
    color?: string
  }
  /** Back button config */
  backButton?: IHeaderIcon
  /** Right icons */
  rightIcons?: IHeaderIcon[]
}
