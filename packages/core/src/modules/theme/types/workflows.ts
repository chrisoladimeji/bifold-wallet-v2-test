/**
 * Workflow Theme Types
 *
 * Credential card themes and workflow renderer configurations.
 */

import { TextStyle } from 'react-native'

// ============================================================================
// CREDENTIAL CARDS
// ============================================================================

/**
 * Card theme matcher pattern
 */
export interface ICardThemePattern {
  /** Pattern type */
  type: 'credDefId' | 'issuerName' | 'schemaName' | 'connectionLabel'
  /** Regex pattern to match */
  regex: string
}

/**
 * Card theme matcher configuration
 */
export interface ICardThemeMatcher {
  /** Match patterns (legacy) */
  patterns?: ICardThemePattern[]
  /** Issuer regex patterns */
  issuerPatterns?: (RegExp | string)[]
  /** Credential type patterns */
  credentialTypes?: string[]
  /** If true, this is the fallback/default theme */
  fallback?: boolean
  /** Alias for fallback */
  default?: boolean
}

/**
 * Card layout types
 */
export type CardLayoutType = 'default' | 'standard' | 'horizontal' | 'student-id' | 'transcript' | 'certificate' | 'badge' | 'compact'

/**
 * Card color set (can be simple or extended)
 */
export interface ICardColorSet {
  primary: string
  secondary?: string
  accent?: string
}

/**
 * Card color configuration
 */
export interface ICardColors {
  /** Background colors (string or color set) */
  background: string | ICardColorSet
  /** Text colors (string or color set) */
  text: string | ICardColorSet
  /** Border color */
  border?: string
  /** Primary/brand color */
  primary?: string
  /** Secondary color */
  secondary?: string
  /** Gradient colors (optional) */
  backgroundGradient?: string[] | null
  /** Secondary text color */
  textSecondary?: string
  /** Bottom stripe color */
  bottomLine?: string
  /** Accent/highlight color */
  accent?: string
}

/**
 * Typography style with color override
 */
export interface ITypographyStyle {
  fontSize: number
  fontWeight?: TextStyle['fontWeight']
  color?: string
  textTransform?: TextStyle['textTransform']
  lineHeight?: number
  letterSpacing?: number
}

/**
 * Card typography configuration
 */
export interface ICardTypography {
  /** Title style */
  title?: ITypographyStyle
  /** Subtitle style */
  subtitle?: ITypographyStyle
  /** Body text style */
  body?: ITypographyStyle
  /** Label style */
  label?: ITypographyStyle
  /** Issuer name style */
  issuerName?: TextStyle
  /** Credential name style */
  credentialName?: TextStyle
  /** Attribute label style */
  attributeLabel?: TextStyle
  /** Attribute value style */
  attributeValue?: TextStyle
  /** Student name style (for ID cards) */
  studentName?: TextStyle
  /** Student ID style (for ID cards) */
  studentId?: TextStyle
  /** Timestamp style */
  timestamp?: TextStyle
}

/**
 * Card asset configuration
 */
export interface ICardAssets {
  /** Logo image/SVG path */
  logo?: string | null
  /** Background pattern image */
  backgroundPattern?: string | null
  /** Watermark image */
  watermark?: string | null
  /** Watermark opacity */
  watermarkOpacity?: number
}

/**
 * Card shadow configuration
 */
export interface ICardShadow {
  color: string
  offset: { width: number; height: number }
  radius: number
  opacity: number
}

/**
 * Card logo configuration
 */
export interface ICardLogoConfig {
  show: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size: number
  borderRadius: number
  margin: number
}

/**
 * Card bottom stripe configuration
 */
export interface ICardBottomStripe {
  show: boolean
  height: number
  borderRadius: number[]
}

/**
 * Card layout configuration
 */
export interface ICardLayoutConfig {
  /** Container styling */
  container?: {
    borderRadius: number
    padding: number
    aspectRatio: number
  }
  /** Padding (shorthand) */
  padding?: number
  /** Border radius (shorthand) */
  borderRadius?: number
  /** Border width */
  borderWidth?: number
  /** Shadow */
  shadow?: ICardShadow
  /** Shadow config (alias) */
  shadowConfig?: ICardShadow
  /** Logo */
  logo?: ICardLogoConfig
  /** Bottom stripe */
  bottomStripe?: ICardBottomStripe
  /** Content visibility flags */
  showIssuerName?: boolean
  showCredentialName?: boolean
  showTimestamp?: boolean
  showAttributes?: boolean
  maxAttributes?: number
  /** Student ID specific */
  showPhoto?: boolean
  showStudentId?: boolean
  showExpiration?: boolean
  showSchool?: boolean
}

/**
 * Complete card theme definition
 */
export interface ICardTheme {
  /** Unique identifier */
  id: string
  /** Matcher configuration */
  matcher: ICardThemeMatcher
  /** Display name */
  displayName: string
  /** Layout type */
  layout: CardLayoutType
  /** Colors */
  colors: ICardColors
  /** Typography */
  typography: ICardTypography
  /** Assets */
  assets: ICardAssets
  /** Layout configuration */
  layoutConfig: ICardLayoutConfig
}

// ============================================================================
// CHAT RENDERERS
// ============================================================================

/**
 * Chat header renderer configuration
 */
export interface IChatHeaderRendererConfig {
  /** Header variant */
  variant: 'default' | 'custom' | 'minimal'
  /** Style */
  style: {
    height: number
    backgroundColor: string
    paddingHorizontal: number
    borderBottomWidth?: number
  }
  /** Back button */
  backButton: {
    show: boolean
    icon: string
    size: number
    color: string
  }
  /** Logo/Avatar */
  logo: {
    show: boolean
    size: number
    borderRadius: number
    backgroundColor: string
    fallbackIcon: string
  }
  /** Title */
  title: TextStyle & {
    marginLeft: number
  }
  /** Right icons */
  rightIcons: Array<{
    id: string
    icon: string
    show: boolean
    size: number
    color: string
  }>
}

/**
 * Chat background renderer configuration
 */
export interface IChatBackgroundRendererConfig {
  /** Background type */
  type: 'solid' | 'gradient'
  /** Solid color */
  color?: string
  /** Gradient colors */
  colors?: string[]
  /** Gradient direction */
  start?: { x: number; y: number }
  end?: { x: number; y: number }
}

// ============================================================================
// MATCH HELPERS
// ============================================================================

/**
 * Credential info for matching
 */
export interface ICredentialMatchInfo {
  credDefId?: string
  issuerName?: string
  schemaName?: string
  connectionLabel?: string
}
