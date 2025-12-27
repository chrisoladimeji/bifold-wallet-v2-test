/**
 * Theme Registry Provider
 *
 * Provides the theme registry to the React component tree.
 */

import React, { useMemo, useEffect } from 'react'
import { IThemeRegistry } from '../registries/ThemeRegistry'
import { ThemeRegistryContext } from '../contexts/ThemeRegistryContext'
import { IThemeManifest, ICardTheme, IBackgroundConfig, IScreenBackgrounds, ITabBarConfig } from '../types'

export interface ThemeRegistryProviderProps {
  /** The theme registry instance */
  registry: IThemeRegistry
  /** Initial theme ID to activate */
  initialThemeId?: string
  /** Pre-bundled theme manifests to register */
  manifests?: IThemeManifest[]
  /** Card themes to register */
  cardThemes?: ICardTheme[]
  /** Background configurations */
  backgrounds?: IBackgroundConfig[]
  /** Screen to background mapping */
  screenBackgrounds?: IScreenBackgrounds
  /** Tab bar configuration */
  tabBarConfig?: ITabBarConfig
  /** Children */
  children: React.ReactNode
}

/**
 * Theme Registry Provider Component
 *
 * @example
 * ```tsx
 * import { ThemeRegistry, ThemeRegistryProvider } from '@bifold/core/modules/theme'
 * import { bifoldTheme } from '@bifold/core/theme'
 *
 * const registry = new ThemeRegistry(bifoldTheme)
 *
 * const App = () => (
 *   <ThemeRegistryProvider
 *     registry={registry}
 *     initialThemeId="teal-dark"
 *     manifests={bundledThemes}
 *   >
 *     <MainApp />
 *   </ThemeRegistryProvider>
 * )
 * ```
 */
export const ThemeRegistryProvider: React.FC<ThemeRegistryProviderProps> = ({
  registry,
  initialThemeId,
  manifests,
  cardThemes,
  backgrounds,
  screenBackgrounds,
  tabBarConfig,
  children,
}) => {
  // Register manifests on mount
  useEffect(() => {
    if (manifests && manifests.length > 0) {
      registry.registerMultiple(manifests)
    }
  }, [registry, manifests])

  // Register card themes
  useEffect(() => {
    if (cardThemes && cardThemes.length > 0) {
      registry.setCardThemes(cardThemes)
    }
  }, [registry, cardThemes])

  // Register backgrounds
  useEffect(() => {
    if (backgrounds && backgrounds.length > 0) {
      registry.setBackgrounds(backgrounds)
    }
  }, [registry, backgrounds])

  // Set screen backgrounds mapping
  useEffect(() => {
    if (screenBackgrounds) {
      registry.setScreenBackgrounds(screenBackgrounds)
    }
  }, [registry, screenBackgrounds])

  // Set tab bar config
  useEffect(() => {
    if (tabBarConfig) {
      registry.setTabBarConfig(tabBarConfig)
    }
  }, [registry, tabBarConfig])

  // Set initial theme
  useEffect(() => {
    if (initialThemeId && registry.has(initialThemeId)) {
      registry.setActive(initialThemeId)
    }
  }, [registry, initialThemeId])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => registry, [registry])

  return (
    <ThemeRegistryContext.Provider value={contextValue}>
      {children}
    </ThemeRegistryContext.Provider>
  )
}

export default ThemeRegistryProvider
