/**
 * Card Theme Registry
 *
 * Manages credential card themes and matches credentials to appropriate themes.
 */

import { ICardTheme, ICardThemeMatcher, ICredentialMatchInfo } from '../types'

/**
 * Card Theme Registry Interface
 */
export interface ICardThemeRegistry {
  // Registration
  register(theme: ICardTheme): void
  unregister(id: string): void
  clear(): void

  // Retrieval
  getTheme(credential: ICredentialMatchInfo): ICardTheme
  getById(id: string): ICardTheme | undefined
  getDefault(): ICardTheme
  list(): ICardTheme[]

  // Configuration
  setDefault(theme: ICardTheme): void
}

/**
 * Create default card theme
 */
function createDefaultCardTheme(): ICardTheme {
  return {
    id: 'default',
    matcher: { fallback: true },
    displayName: 'Default Credential',
    layout: 'default',
    colors: {
      primary: '#42803E',
      secondary: '#FFFFFF',
      background: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#666666',
      bottomLine: '#42803E',
      accent: '#FCBA19',
    },
    typography: {
      issuerName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666666',
      },
      credentialName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
      },
      attributeLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666666',
      },
      attributeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
      },
    },
    assets: {},
    layoutConfig: {
      container: {
        borderRadius: 12,
        padding: 16,
        aspectRatio: 1.6,
      },
      shadow: {
        color: '#000000',
        offset: { width: 0, height: 4 },
        radius: 12,
        opacity: 0.15,
      },
      logo: {
        show: true,
        position: 'top-left',
        size: 40,
        borderRadius: 8,
        margin: 16,
      },
      bottomStripe: {
        show: true,
        height: 8,
        borderRadius: [0, 0, 12, 12],
      },
      showIssuerName: true,
      showCredentialName: true,
      showTimestamp: true,
      showAttributes: true,
      maxAttributes: 3,
    },
  }
}

/**
 * Card Theme Registry Implementation
 */
export class CardThemeRegistry implements ICardThemeRegistry {
  private themes: Map<string, ICardTheme> = new Map()
  private defaultTheme: ICardTheme

  constructor() {
    this.defaultTheme = createDefaultCardTheme()
  }

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  register(theme: ICardTheme): void {
    this.themes.set(theme.id, theme)

    // Update default if this is a fallback theme
    if (theme.matcher.fallback) {
      this.defaultTheme = theme
    }
  }

  unregister(id: string): void {
    const theme = this.themes.get(id)
    this.themes.delete(id)

    // Reset default if we removed the fallback
    if (theme?.matcher.fallback) {
      this.defaultTheme = createDefaultCardTheme()
    }
  }

  clear(): void {
    this.themes.clear()
    this.defaultTheme = createDefaultCardTheme()
  }

  // ============================================================================
  // RETRIEVAL
  // ============================================================================

  getTheme(credential: ICredentialMatchInfo): ICardTheme {
    // Try to match patterns
    for (const theme of this.themes.values()) {
      // Skip fallback themes in pattern matching
      if (theme.matcher.fallback) continue

      if (this.matchesTheme(theme.matcher, credential)) {
        return theme
      }
    }

    return this.defaultTheme
  }

  getById(id: string): ICardTheme | undefined {
    return this.themes.get(id)
  }

  getDefault(): ICardTheme {
    return this.defaultTheme
  }

  list(): ICardTheme[] {
    return Array.from(this.themes.values())
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  setDefault(theme: ICardTheme): void {
    this.defaultTheme = theme
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private matchesTheme(matcher: ICardThemeMatcher, credential: ICredentialMatchInfo): boolean {
    if (!matcher.patterns || matcher.patterns.length === 0) {
      return false
    }

    for (const pattern of matcher.patterns) {
      const regex = new RegExp(pattern.regex, 'i')
      let value: string | undefined

      switch (pattern.type) {
        case 'credDefId':
          value = credential.credDefId
          break
        case 'issuerName':
          value = credential.issuerName
          break
        case 'schemaName':
          value = credential.schemaName
          break
        case 'connectionLabel':
          value = credential.connectionLabel
          break
      }

      if (value && regex.test(value)) {
        return true
      }
    }

    return false
  }
}

/**
 * Factory function
 */
export function createCardThemeRegistry(): ICardThemeRegistry {
  return new CardThemeRegistry()
}
