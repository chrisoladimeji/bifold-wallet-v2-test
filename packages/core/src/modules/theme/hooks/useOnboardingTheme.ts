/**
 * useOnboardingTheme Hook
 *
 * Returns the modular onboarding theme configurations.
 */

import { useMemo } from 'react'
import { useOptionalThemeRegistry } from './useThemeRegistry'
import {
  onboardingCardTheme,
  onboardingToggleTheme,
  onboardingCheckboxTheme,
  bulletListTheme,
  unlockScreenTheme,
  termsContentTheme,
  pinTextFieldTheme,
  buttonThemes,
  inputThemes,
  colorPalette,
} from '../themes/teal-dark'

/**
 * Onboarding theme configuration
 */
export interface IOnboardingTheme {
  card: typeof onboardingCardTheme
  toggle: typeof onboardingToggleTheme
  checkbox: typeof onboardingCheckboxTheme
  bulletList: typeof bulletListTheme
  unlockScreen: typeof unlockScreenTheme
  termsContent: typeof termsContentTheme
  pinTextField: typeof pinTextFieldTheme
  buttons: typeof buttonThemes
  inputs: typeof inputThemes
  colors: typeof colorPalette
}

/**
 * Default onboarding theme (teal-dark)
 */
const defaultOnboardingTheme: IOnboardingTheme = {
  card: onboardingCardTheme,
  toggle: onboardingToggleTheme,
  checkbox: onboardingCheckboxTheme,
  bulletList: bulletListTheme,
  unlockScreen: unlockScreenTheme,
  termsContent: termsContentTheme,
  pinTextField: pinTextFieldTheme,
  buttons: buttonThemes,
  inputs: inputThemes,
  colors: colorPalette,
}

/**
 * Hook to get the onboarding theme configuration
 *
 * @returns Onboarding theme configuration
 *
 * @example
 * ```tsx
 * const OnboardingScreen = () => {
 *   const onboardingTheme = useOnboardingTheme()
 *
 *   return (
 *     <View style={onboardingTheme.card.container}>
 *       <Text style={onboardingTheme.card.title}>Welcome</Text>
 *       <TouchableOpacity style={onboardingTheme.buttons.primary.container}>
 *         <Text style={onboardingTheme.buttons.primary.text}>Get Started</Text>
 *       </TouchableOpacity>
 *     </View>
 *   )
 * }
 * ```
 */
export function useOnboardingTheme(): IOnboardingTheme {
  const registry = useOptionalThemeRegistry()

  // Registry available for future use when multiple onboarding themes are supported
  void registry

  return useMemo(() => {
    // For now, always return the teal-dark onboarding theme
    // In the future, this could be extended to support multiple themes
    // by storing onboarding configurations in the registry
    return defaultOnboardingTheme
  }, [])
}

/**
 * Hook to check if modular onboarding theme is active
 */
export function useIsModularOnboardingActive(): boolean {
  const registry = useOptionalThemeRegistry()
  return !!registry
}

export default useOnboardingTheme
