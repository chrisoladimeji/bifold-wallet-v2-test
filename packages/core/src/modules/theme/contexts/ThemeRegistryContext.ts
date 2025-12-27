/**
 * Theme Registry Context
 *
 * Separate file to avoid circular imports.
 */

import { createContext } from 'react'
import { IThemeRegistry } from '../registries/ThemeRegistry'

/**
 * Theme Registry Context
 * Used by components to access the theme registry
 */
export const ThemeRegistryContext = createContext<IThemeRegistry | undefined>(undefined)
