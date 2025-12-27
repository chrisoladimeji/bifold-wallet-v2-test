/**
 * KanonOCABundleResolver
 *
 * Extends DefaultOCABundleResolver to fetch OCA overlays from Kanon ledger
 * via the backend API. Falls back to static bundles when ledger data is unavailable.
 */

import {
  DefaultOCABundleResolver,
  OCABundle,
  OCABundleResolverOptions,
  OCABundleResolveParams,
  BrandingOverlayType,
} from '@bifold/oca/build/legacy'
import { IOverlayBundleData, IBrandingOverlayData, IMetaOverlayData } from '@bifold/oca'
import { OverlayBundle, OverlayType } from '@bifold/oca/build/types'

export interface KanonOCABundleResolverOptions extends OCABundleResolverOptions {
  /** Base URL of the backend API (e.g., https://api.example.com) */
  apiBaseUrl?: string
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number
}

interface CachedOverlay {
  overlay: OverlayBundle
  timestamp: number
}

interface ApiOverlayResponse {
  success: boolean
  credentialDefinitionId: string
  overlay?: {
    meta?: {
      name?: string
      description?: string
      issuer?: string
      issuer_url?: string
      issuer_description?: string
    }
    branding?: {
      primary_background_color?: string
      secondary_background_color?: string
      primary_attribute?: string
      secondary_attribute?: string
      logo?: string
      background_image?: string
    }
  }
}

export class KanonOCABundleResolver extends DefaultOCABundleResolver {
  private apiBaseUrl?: string
  private cacheTTL: number
  private apiCache: Map<string, CachedOverlay> = new Map()

  constructor(
    bundlesData: Record<string, IOverlayBundleData | string> = {},
    options?: KanonOCABundleResolverOptions
  ) {
    super(bundlesData, options)
    this.apiBaseUrl = options?.apiBaseUrl
    this.cacheTTL = options?.cacheTTL ?? 5 * 60 * 1000 // 5 minutes default
  }

  /**
   * Check if a credential definition ID is a Kanon DID
   */
  private isKanonCredDef(credDefId?: string): boolean {
    return !!credDefId?.includes('did:kanon')
  }

  /**
   * Fetch overlay from the Kanon backend API
   */
  private async fetchOverlayFromApi(credDefId: string): Promise<OverlayBundle | undefined> {
    if (!this.apiBaseUrl) {
      this.log?.info('No API base URL configured, skipping Kanon overlay fetch')
      return undefined
    }

    // Check cache first
    const cached = this.apiCache.get(credDefId)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.log?.info(`Using cached overlay for ${credDefId}`)
      return cached.overlay
    }

    try {
      // Encode the credDefId for URL (it contains special characters like :, /)
      const encodedCredDefId = encodeURIComponent(credDefId)
      const url = `${this.apiBaseUrl}/credential-definitions/${encodedCredDefId}/overlay`

      this.log?.info(`Fetching overlay from Kanon API: ${url}`)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          this.log?.info(`No overlay found for ${credDefId} on Kanon ledger`)
          return undefined
        }
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data: ApiOverlayResponse = await response.json()

      if (!data.success || !data.overlay) {
        this.log?.info(`No overlay data in API response for ${credDefId}`)
        return undefined
      }

      // Convert API response to OCABundle format
      const overlayBundle = this.convertApiOverlayToBundle(credDefId, data.overlay)

      // Cache the result
      if (overlayBundle) {
        this.apiCache.set(credDefId, {
          overlay: overlayBundle,
          timestamp: Date.now(),
        })
      }

      return overlayBundle
    } catch (error) {
      this.log?.error(`Failed to fetch overlay from Kanon API: ${error}`)
      return undefined
    }
  }

  /**
   * Convert API overlay response to OCABundle format
   */
  private convertApiOverlayToBundle(
    credDefId: string,
    overlay: NonNullable<ApiOverlayResponse['overlay']>
  ): OverlayBundle | undefined {
    try {
      const overlays: (IMetaOverlayData | IBrandingOverlayData)[] = []

      // Add meta overlay if present
      if (overlay.meta) {
        const metaOverlay: IMetaOverlayData = {
          capture_base: '',
          type: OverlayType.Meta10,
          name: overlay.meta.name || '',
          description: overlay.meta.description || '',
          issuer: overlay.meta.issuer || '',
          issuer_url: overlay.meta.issuer_url || '',
          issuer_description: overlay.meta.issuer_description || '',
          language: 'en',
          credential_help_text: '',
          credential_support_url: '',
        }
        overlays.push(metaOverlay)
      }

      // Add branding overlay if present
      if (overlay.branding) {
        const brandingOverlay: IBrandingOverlayData = {
          capture_base: '',
          type: this.getBrandingOverlayType() === BrandingOverlayType.Branding01
            ? OverlayType.Branding01
            : OverlayType.Branding10,
          primary_background_color: overlay.branding.primary_background_color,
          secondary_background_color: overlay.branding.secondary_background_color,
          primary_attribute: overlay.branding.primary_attribute,
          secondary_attribute: overlay.branding.secondary_attribute,
          logo: overlay.branding.logo,
          background_image: overlay.branding.background_image,
        }
        overlays.push(brandingOverlay)
      }

      if (overlays.length === 0) {
        return undefined
      }

      const bundleData: IOverlayBundleData = {
        capture_base: {
          attributes: {},
          classification: '',
          type: OverlayType.CaptureBase10,
          flagged_attributes: [],
        },
        overlays,
      }

      return new OverlayBundle(credDefId, bundleData)
    } catch (error) {
      this.log?.error(`Failed to convert API overlay to bundle: ${error}`)
      return undefined
    }
  }

  /**
   * Override resolve to first try static bundles, then Kanon API
   */
  public async resolve(params: OCABundleResolveParams): Promise<OCABundle | undefined> {
    // First try to resolve from static bundles
    const staticBundle = await super.resolve(params)
    if (staticBundle) {
      this.log?.info(`Resolved overlay from static bundle for ${params.identifiers.credentialDefinitionId}`)
      return staticBundle
    }

    // If not found and it's a Kanon credential definition, try the API
    const credDefId = params.identifiers.credentialDefinitionId
    if (this.isKanonCredDef(credDefId) && credDefId) {
      this.log?.info(`Attempting to fetch overlay from Kanon API for ${credDefId}`)
      const apiBundle = await this.fetchOverlayFromApi(credDefId)

      if (apiBundle) {
        // Store in bundles for future lookups within this session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as unknown as { bundles: Record<string, typeof apiBundle> }).bundles[credDefId] = apiBundle

        return new OCABundle(apiBundle, {
          brandingOverlayType: this.getBrandingOverlayType(),
          language: params.language,
        })
      }
    }

    return undefined
  }

  /**
   * Clear the API cache
   */
  public clearCache(): void {
    this.apiCache.clear()
  }

  /**
   * Set the API base URL dynamically
   */
  public setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url
    this.clearCache()
  }
}

/**
 * Factory function to create a KanonOCABundleResolver
 */
export function createKanonOCABundleResolver(
  bundlesData: Record<string, IOverlayBundleData | string> = {},
  options?: KanonOCABundleResolverOptions
): KanonOCABundleResolver {
  return new KanonOCABundleResolver(bundlesData, options)
}
