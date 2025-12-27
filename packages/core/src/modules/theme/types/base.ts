/**
 * Base Theme Types
 *
 * Core theme tokens: colors, typography, spacing.
 */

import { TextStyle } from 'react-native'

/**
 * Extended color palette with theme-specific colors
 */
export interface IExtendedColors {
  /** Card-specific colors */
  card: {
    /** Card background (can be semi-transparent) */
    background: string
    /** Solid card background alternative */
    backgroundSolid: string
    /** Card border color */
    border: string
  }
  /** Tab bar colors */
  tabBar: {
    /** Tab bar background */
    background: string
  }
  /** Indicator colors */
  indicator: {
    /** Unread indicator (blue dot) */
    unread: string
    /** Badge background (red) */
    badge: string
    /** Badge text color */
    badgeText: string
  }
}

/**
 * YAML color palette structure (before processing)
 */
export interface IYamlColorPalette {
  brand: {
    primary: string
    primaryDisabled?: string
    primaryLight?: string
    secondary: string
    secondaryDisabled?: string
    tertiary?: string
    tertiaryDisabled?: string
    primaryBackground: string
    secondaryBackground: string
    tertiaryBackground?: string
    modalPrimaryBackground?: string
    modalSecondaryBackground?: string
    modalTertiaryBackground?: string
    modalPrimary?: string
    modalSecondary?: string
    highlight?: string
    link?: string
    text: string
    textSecondary?: string
    textMuted?: string
    icon?: string
    headerIcon?: string
    headerText?: string
    buttonText?: string
    tabBarInactive?: string
    inlineError?: string
    inlineWarning?: string
  }
  semantic: {
    error: string
    success: string
    focus: string
    warning?: string
    info?: string
  }
  notification: {
    success: string
    successBorder: string
    successIcon: string
    successText: string
    info: string
    infoBorder: string
    infoIcon: string
    infoText: string
    warn: string
    warnBorder: string
    warnIcon: string
    warnText: string
    error: string
    errorBorder: string
    errorIcon: string
    errorText: string
    popupOverlay: string
  }
  grayscale: {
    black: string
    darkGrey: string
    mediumGrey: string
    lightGrey: string
    veryLightGrey: string
    white: string
  }
  /** Theme-specific extended colors */
  extended?: IExtendedColors
}

/**
 * Typography variant definition
 */
export interface ITypographyVariant {
  fontSize: number
  fontWeight: TextStyle['fontWeight']
  lineHeight?: number
  letterSpacing?: number
  textTransform?: TextStyle['textTransform']
  color?: string
}

/**
 * YAML typography structure
 */
export interface IYamlTypography {
  /** Primary font family */
  fontFamily?: {
    primary?: string
    secondary?: string
    mono?: string
  }
  /** Typography scale */
  scale: {
    h1: ITypographyVariant
    h2: ITypographyVariant
    h3: ITypographyVariant
    h4: ITypographyVariant
    body: ITypographyVariant
    bodySmall: ITypographyVariant
    caption: ITypographyVariant
    label: ITypographyVariant
  }
}

/**
 * Spacing scale
 */
export interface IYamlSpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

/**
 * Border radius scale
 */
export interface IYamlBorderRadius {
  sm: number
  md: number
  lg: number
  xl: number
  full: number
}

/**
 * Complete base theme YAML structure
 */
export interface IYamlBaseTheme {
  colorPalette: IYamlColorPalette
  typography?: IYamlTypography
  spacing?: IYamlSpacing
  borderRadius?: IYamlBorderRadius
  buttons?: IButtonThemes
}

// ============================================================================
// BUTTON THEMES
// ============================================================================

/**
 * Button style configuration
 */
export interface IButtonStyle {
  /** Container styling */
  container: {
    backgroundColor: string
    borderRadius: number
    borderWidth?: number
    borderColor?: string
    paddingVertical: number
    paddingHorizontal: number
    minHeight?: number
  }
  /** Text styling */
  text: {
    color: string
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    textTransform?: TextStyle['textTransform']
  }
  /** Disabled state */
  disabled?: {
    backgroundColor?: string
    borderColor?: string
    textColor?: string
    opacity?: number
  }
}

/**
 * Button theme variants
 */
export interface IButtonThemes {
  /** Primary button (filled with brand color) */
  primary: IButtonStyle
  /** Secondary button (outlined style) */
  secondary: IButtonStyle
  /** Tertiary button (accent/alternative filled - e.g., purple) */
  tertiary?: IButtonStyle
  /** Critical/destructive button */
  critical?: IButtonStyle
  /** Ghost/text button */
  ghost?: IButtonStyle
}

// ============================================================================
// INPUT THEMES
// ============================================================================

/**
 * Text input style configuration
 */
export interface ITextInputStyle {
  /** Container styling */
  container: {
    backgroundColor: string
    borderRadius: number
    borderWidth: number
    borderColor: string
    paddingVertical: number
    paddingHorizontal: number
    minHeight?: number
  }
  /** Text styling */
  text: {
    color: string
    fontSize: number
  }
  /** Placeholder styling */
  placeholder: {
    color: string
  }
  /** Focused state */
  focused?: {
    borderColor: string
    borderWidth?: number
  }
  /** Error state */
  error?: {
    borderColor: string
    backgroundColor?: string
  }
  /** Icon styling (e.g., eye icon for password) */
  icon?: {
    color: string
    size: number
  }
}

/**
 * Input theme variants
 */
export interface IInputThemes {
  /** Default text input */
  default: ITextInputStyle
  /** Rounded style (for onboarding PIN inputs) */
  rounded?: ITextInputStyle
  /** Search input */
  search?: ITextInputStyle
}
