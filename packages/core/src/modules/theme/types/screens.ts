/**
 * Screen Theme Types
 *
 * Per-screen theme configurations.
 */

import { TextStyle, ViewStyle } from 'react-native'
import { IBackgroundConfig, IHeaderConfig, IHeaderIcon } from './navigation'

/**
 * Base screen theme (common properties)
 */
export interface IBaseScreenTheme {
  /** Screen background override */
  background?: IBackgroundConfig
  /** Header configuration */
  header?: IHeaderConfig
}

// ============================================================================
// HOME SCREEN
// ============================================================================

/**
 * Notification card theme
 */
export interface INotificationCardTheme {
  /** Card container */
  container: {
    backgroundColor: string
    borderRadius: number
    padding: number
    marginBottom: number
    borderWidth?: number
    borderColor?: string
    shadowColor?: string
    shadowOffset?: { width: number; height: number }
    shadowRadius?: number
    shadowOpacity?: number
    elevation?: number
  }
  /** Logo/avatar */
  logo: {
    container: {
      width: number
      height: number
      borderRadius: number
      backgroundColor: string
      overflow?: ViewStyle['overflow']
      justifyContent?: ViewStyle['justifyContent']
      alignItems?: ViewStyle['alignItems']
    }
    image: {
      width: number
      height: number
      resizeMode: 'contain' | 'cover'
    }
    fallbackIcon: string
    fallbackIconSize: number
    fallbackIconColor: string
  }
  /** Content area */
  content: {
    container: {
      flex: number
      marginLeft: number
      marginRight: number
    }
    title: TextStyle & {
      numberOfLines?: number
    }
    timestamp: TextStyle
    description: TextStyle & {
      numberOfLines?: number
    }
  }
  /** Indicators */
  indicators: {
    unreadDot: {
      show: boolean
      size: number
      color: string
      position: { top: number; right: number }
    }
    chevron: {
      show: boolean
      icon: string
      size: number
      color: string
    }
  }
}

/**
 * Empty state theme
 */
export interface IEmptyStateTheme {
  icon: string
  iconSize: number
  iconColor: string
  title: string
  titleStyle: TextStyle
  subtitle: string
  subtitleStyle: TextStyle
}

/**
 * Home screen theme
 */
export interface IHomeScreenTheme extends IBaseScreenTheme {
  /** Header specific to home */
  header: {
    container: {
      paddingHorizontal: number
      paddingTop: number
      paddingBottom: number
    }
    title: {
      text: string
      fontSize: number
      fontWeight: TextStyle['fontWeight']
      color: string
    }
    rightIcon: IHeaderIcon
  }
  /** Notification list */
  notificationList: {
    container: {
      paddingHorizontal: number
      paddingTop: number
    }
    emptyState: IEmptyStateTheme
  }
  /** Notification card */
  notificationCard: INotificationCardTheme
  /** Welcome section (optional) */
  welcome?: {
    show: boolean
    container: ViewStyle
    title: {
      text: string
      style: TextStyle
    }
    subtitle: {
      style: TextStyle
    }
  }
}

// ============================================================================
// ONBOARDING SCREEN
// ============================================================================

/**
 * Onboarding page definition
 */
export interface IOnboardingPage {
  id: string
  image: string
  headerKey: string
  bodyKey: string
}

/**
 * Onboarding screen theme
 */
export interface IOnboardingScreenTheme extends IBaseScreenTheme {
  /** Container */
  container: {
    backgroundColor: string
  }
  /** Carousel container */
  carousel: {
    backgroundColor: string
  }
  /** Header tint */
  headerTintColor: string
  /** Header text style */
  headerText: TextStyle
  /** Body text style */
  bodyText: TextStyle
  /** Pagination dots */
  pagerDots: {
    containerStyle: ViewStyle
    dot: {
      width: number
      height: number
      borderRadius: number
      borderWidth: number
      borderColor: string
      marginHorizontal: number
    }
    dotActive: {
      backgroundColor: string
    }
    dotInactive: {
      backgroundColor: string
    }
  }
  /** Navigation buttons */
  navigation: {
    button: {
      color: string
      fontSize: number
      fontWeight: TextStyle['fontWeight']
    }
    skipButton: {
      color: string
    }
  }
  /** Image display */
  imageDisplay: {
    fill: string
    maxWidth: number
    maxHeight: number
  }
  /** Pages configuration */
  pages: IOnboardingPage[]
  /** Card theme for modal-style onboarding steps */
  card?: IOnboardingCardTheme
}

// ============================================================================
// ONBOARDING CARD (Modal-style container for onboarding steps)
// ============================================================================

/**
 * Shadow configuration
 */
export interface IShadowConfig {
  color: string
  offset: { width: number; height: number }
  radius: number
  opacity: number
  elevation?: number
}

/**
 * Onboarding card container theme
 * Used for Terms, Biometrics, PIN creation, Push notifications screens
 */
export interface IOnboardingCardTheme {
  /** Card container styling */
  container: {
    backgroundColor: string
    borderRadius: number
    padding: number
    paddingTop: number
    paddingBottom: number
    paddingHorizontal: number
    marginHorizontal: number
    marginBottom: number
    /** Position from bottom (for bottom-aligned cards) */
    position?: 'bottom' | 'center'
    /** Max height as percentage of screen */
    maxHeightPercent?: number
  }
  /** Shadow styling */
  shadow?: IShadowConfig
  /** Title text style */
  title: TextStyle
  /** Subtitle/instruction text style (often accent colored) */
  subtitle: TextStyle
  /** Accent text style (teal colored instructions) */
  accentText: TextStyle
  /** Body text style (gray descriptive text) */
  bodyText: TextStyle
  /** Scrollable content area */
  scrollArea?: {
    maxHeight: number
    paddingRight: number
    scrollIndicatorColor?: string
  }
  /** Continue button styling within card */
  button: {
    marginTop: number
    style?: ViewStyle
  }
}

/**
 * Bullet list theme (for notification types list)
 */
export interface IBulletListTheme {
  /** Container styling */
  container: ViewStyle
  /** Individual item styling */
  item: {
    marginBottom: number
    flexDirection: 'row'
  }
  /** Bullet point */
  bullet: {
    character: string
    color: string
    fontSize: number
    marginRight: number
    lineHeight?: number
  }
  /** Item text */
  text: TextStyle
}

/**
 * Toggle switch theme
 */
export interface IOnboardingToggleTheme {
  /** Track colors */
  track: {
    onColor: string
    offColor: string
  }
  /** Thumb color */
  thumb: {
    color: string
  }
  /** Label text */
  label: TextStyle
  /** Container */
  container: {
    marginTop: number
    marginBottom: number
    flexDirection: 'row'
    alignItems: 'center'
  }
}

/**
 * Checkbox theme for terms acceptance
 */
export interface IOnboardingCheckboxTheme {
  /** Unchecked state */
  unchecked: {
    borderColor: string
    borderWidth: number
    backgroundColor: string
    borderRadius: number
    size: number
  }
  /** Checked state */
  checked: {
    borderColor: string
    backgroundColor: string
    checkColor: string
  }
  /** Label text */
  label: TextStyle
  /** Container */
  container: {
    marginTop: number
    flexDirection: 'row'
    alignItems: 'center'
  }
}

// ============================================================================
// UNLOCK/SPLASH SCREEN
// ============================================================================

/**
 * Divider with text (e.g., "OR" between buttons)
 */
export interface IDividerTheme {
  /** Container styling */
  container: {
    flexDirection: 'row'
    alignItems: 'center'
    marginVertical: number
  }
  /** Line styling */
  line: {
    flex: number
    height: number
    backgroundColor: string
  }
  /** Text styling */
  text: TextStyle & {
    marginHorizontal: number
  }
}

/**
 * Unlock/Splash screen theme
 * Shown when app is locked and user needs to authenticate
 */
export interface IUnlockScreenTheme extends IBaseScreenTheme {
  /** Logo/branding image */
  logo: {
    /** Logo component name or image path */
    source?: string
    /** Logo dimensions */
    width: number
    height: number
    /** Margin below logo */
    marginBottom: number
    /** Tint color (for SVG) */
    tintColor?: string
  }
  /** App name text */
  appName: TextStyle & {
    marginBottom?: number
  }
  /** Tagline/subtitle text */
  tagline: TextStyle & {
    marginBottom: number
  }
  /** Buttons container */
  buttonsContainer: {
    marginTop: number
    paddingHorizontal: number
    width?: number | string
  }
  /** Primary button (outlined style - "UNLOCK WITH PIN") */
  primaryButton: {
    container: ViewStyle & {
      borderWidth: number
      borderColor: string
      borderRadius: number
      paddingVertical: number
      paddingHorizontal: number
      backgroundColor: string
    }
    text: TextStyle
  }
  /** Secondary button (filled style - "UNLOCK WITH BIOMETRICS") */
  secondaryButton: {
    container: ViewStyle & {
      borderRadius: number
      paddingVertical: number
      paddingHorizontal: number
      backgroundColor: string
    }
    text: TextStyle
  }
  /** "OR" divider between buttons */
  divider: IDividerTheme
}

// ============================================================================
// TERMS SCREEN
// ============================================================================

/**
 * Terms and conditions screen theme
 */
export interface ITermsScreenTheme extends IBaseScreenTheme {
  /** Uses onboarding card style */
  card: IOnboardingCardTheme
  /** Scrollable terms content */
  content: {
    /** Section headers (e.g., "Definitions", "License") */
    sectionHeader: TextStyle
    /** Body paragraphs */
    paragraph: TextStyle
    /** Emphasized text */
    emphasis: TextStyle
  }
  /** Acceptance checkbox */
  checkbox: IOnboardingCheckboxTheme
}

// ============================================================================
// BIOMETRY SCREEN
// ============================================================================

/**
 * Biometry setup screen theme
 */
export interface IBiometryScreenTheme extends IBaseScreenTheme {
  /** Uses onboarding card style */
  card: IOnboardingCardTheme
  /** Toggle switch */
  toggle: IOnboardingToggleTheme
  /** Icon styling (fingerprint/face icon) */
  icon?: {
    size: number
    color: string
    marginBottom: number
  }
}

// ============================================================================
// PUSH NOTIFICATIONS SCREEN
// ============================================================================

/**
 * Push notifications screen theme
 */
export interface IPushNotificationsScreenTheme extends IBaseScreenTheme {
  /** Uses onboarding card style */
  card: IOnboardingCardTheme
  /** Bullet list for notification types */
  bulletList: IBulletListTheme
  /** Toggle switch */
  toggle: IOnboardingToggleTheme
}

// ============================================================================
// PIN CREATE SCREEN (Enhanced)
// ============================================================================

/**
 * Text field style PIN input (rounded border input)
 */
export interface ITextFieldPINInput {
  /** Input container */
  container: ViewStyle & {
    borderWidth: number
    borderColor: string
    borderRadius: number
    backgroundColor: string
    paddingHorizontal: number
    paddingVertical: number
    marginBottom: number
  }
  /** Focused state */
  focused: {
    borderColor: string
    borderWidth?: number
  }
  /** Error state */
  error: {
    borderColor: string
  }
  /** Input text */
  text: TextStyle
  /** Placeholder text */
  placeholder: {
    color: string
  }
  /** Visibility toggle icon (eye) */
  visibilityIcon: {
    size: number
    color: string
    activeColor?: string
  }
}

/**
 * PIN creation screen theme (enhanced)
 */
export interface IPINCreateScreenTheme extends IBaseScreenTheme {
  /** Uses onboarding card style */
  card: IOnboardingCardTheme
  /** Text field style input (alternative to cell-based) */
  textFieldInput?: ITextFieldPINInput
  /** Validation rules display */
  validationRules?: {
    container: ViewStyle
    ruleText: TextStyle
    ruleIcon: {
      valid: { color: string }
      invalid: { color: string }
      size: number
    }
  }
}

// ============================================================================
// SETTINGS SCREEN
// ============================================================================

/**
 * Settings row theme
 */
export interface ISettingsRowTheme {
  height: number
  paddingHorizontal: number
  backgroundColor: string
  title: TextStyle
  subtitle: TextStyle
  icon: {
    size: number
    color: string
  }
  chevron: {
    color: string
  }
}

/**
 * Toggle theme
 */
export interface IToggleTheme {
  trackColorOn: string
  trackColorOff: string
  thumbColor: string
}

/**
 * Settings screen theme
 */
export interface ISettingsScreenTheme extends IBaseScreenTheme {
  /** New settings colors */
  newSettingColors: {
    bgColorUp: string
    bgColorDown: string
    headerTitle: string
    buttonColor: string
    bgSection: string
    textColor: string
    textBody: string
    deleteBtn: string
  }
  /** Section styling */
  section: {
    header: TextStyle & {
      marginBottom: number
    }
    background: string
  }
  /** Row styling */
  row: ISettingsRowTheme
  /** Toggle styling */
  toggle: IToggleTheme
}

// ============================================================================
// CHAT SCREEN
// ============================================================================

/**
 * Chat bubble theme
 */
export interface IChatBubbleTheme {
  backgroundColor: string
  borderRadius: number
  padding: number
  marginLeft?: number
  marginRight?: number
  maxWidth?: string
}

/**
 * Chat screen theme
 */
export interface IChatScreenTheme extends IBaseScreenTheme {
  /** Message bubbles */
  bubbles: {
    left: IChatBubbleTheme
    right: IChatBubbleTheme
  }
  /** Text in bubbles */
  text: {
    left: TextStyle
    right: TextStyle
    leftHighlighted: TextStyle
    rightHighlighted: TextStyle
  }
  /** Timestamps */
  timestamp: {
    left: TextStyle
    right: TextStyle
  }
  /** Input toolbar */
  inputToolbar: ViewStyle
  /** Input text */
  inputText: TextStyle
  /** Send button */
  send: {
    enabledColor: string
    disabledColor: string
  }
  /** Document icon */
  documentIcon: {
    color: string
    containerBackground: string
    containerSize: number
    containerBorderRadius: number
  }
  /** Open button (View Offer, etc.) */
  openButton: {
    backgroundColor: string
    borderRadius: number
    paddingVertical: number
    paddingHorizontal: number
    marginTop: number
    text: TextStyle
  }
  /** Custom header */
  customHeader?: {
    backgroundColor: string
    height: number
    title: TextStyle
    logo: {
      size: number
      borderRadius: number
    }
    icons: {
      color: string
      size: number
    }
  }
  /** Custom background */
  customBackground?: IBackgroundConfig
}

// ============================================================================
// PIN SCREEN
// ============================================================================

/**
 * PIN cell theme
 */
export interface IPINCellTheme {
  backgroundColor: string
  borderColor: string
  borderWidth?: number
  borderRadius: number
  width: number
  height: number
  marginHorizontal?: number
}

/**
 * PIN screen theme
 */
export interface IPINScreenTheme extends IBaseScreenTheme {
  /** PIN-specific header with logo/image */
  pinHeader?: {
    component?: string
    image?: string
    imageStyle?: ViewStyle
  }
  /** Standard PIN input */
  standardInput: {
    cell: IPINCellTheme
    focusedCell: {
      borderColor: string
      borderWidth?: number
    }
    text: TextStyle
    icon: {
      color: string
    }
    container: ViewStyle
  }
  /** Separated PIN input (new design) */
  separatedInput: {
    cell: IPINCellTheme
    focusedCell: {
      borderColor: string
      borderWidth?: number
    }
    text: TextStyle
    icon: {
      color: string
    }
    container: ViewStyle
  }
  /** Enter screen specific */
  enter?: {
    title: {
      text: string
      style: TextStyle
    }
    biometryButton?: {
      size: number
      color: string
    }
  }
  /** Create screen specific */
  create?: {
    title: {
      text: string
      style: TextStyle
    }
    subtitle?: {
      text: string
      style: TextStyle
    }
    rules?: {
      show: boolean
      color: string
    }
  }
}

// ============================================================================
// UNION TYPE
// ============================================================================

/**
 * All screen theme types
 */
export type IScreenTheme =
  | IHomeScreenTheme
  | IOnboardingScreenTheme
  | ISettingsScreenTheme
  | IChatScreenTheme
  | IPINScreenTheme
  | IUnlockScreenTheme
  | ITermsScreenTheme
  | IBiometryScreenTheme
  | IPushNotificationsScreenTheme
  | IPINCreateScreenTheme
  | IBaseScreenTheme
