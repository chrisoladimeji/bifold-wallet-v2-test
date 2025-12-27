import { Agent } from '@credo-ts/core'
import {
  DefaultOCABundleResolver,
  OCABundle,
  OCABundleResolveAllParams,
  OCABundleResolverOptions,
  Identifiers,
  CredentialOverlay,
} from '@bifold/oca/build/legacy'
import { BrandingOverlay } from '@bifold/oca'

/**
 * Custom OCA Bundle Resolver that extends DefaultOCABundleResolver
 * to support fetching OCA overlays from Kanon credential definitions.
 *
 * When a credential definition ID is not found in the local bundle,
 * it attempts to fetch the overlay from the credential definition metadata.
 */
export class KanonOCABundleResolver extends DefaultOCABundleResolver {
  private agent: Agent | null = null
  private cachedOverlays: Map<string, OCABundle> = new Map()

  constructor(bundle?: Record<string, unknown>, options?: OCABundleResolverOptions) {
    super(bundle, options)
  }

  /**
   * Set the agent instance for fetching credential definitions
   */
  public setAgent(agent: Agent) {
    this.agent = agent
  }

  /**
   * Resolve OCA bundle - first tries local bundle, then fetches from Kanon if not found
   */
  public async resolve(params: { identifiers: Identifiers; language?: string }): Promise<OCABundle | undefined> {
    // First try the default resolver (local bundles)
    const localBundle = await super.resolve(params)
    if (localBundle) {
      return localBundle
    }

    // Check cache
    const credDefId = params.identifiers.credentialDefinitionId
    if (credDefId && this.cachedOverlays.has(credDefId)) {
      return this.cachedOverlays.get(credDefId)
    }

    // Try to fetch from Kanon credential definition
    if (credDefId && this.agent) {
      try {
        const kanonBundle = await this.fetchKanonOCA(credDefId, params.language)
        if (kanonBundle) {
          this.cachedOverlays.set(credDefId, kanonBundle)
          return kanonBundle
        }
      } catch (error) {
        console.warn(`Failed to fetch Kanon OCA for ${credDefId}:`, error)
      }
    }

    return undefined
  }

  /**
   * Fetch OCA overlay from Kanon credential definition metadata
   */
  private async fetchKanonOCA(credDefId: string, language?: string): Promise<OCABundle | undefined> {
    if (!this.agent) {
      return undefined
    }

    try {
      const result = await this.agent.modules.anoncreds.getCredentialDefinition(credDefId)

      // Check for overlay in metadata
      const overlay = (result.credentialDefinitionMetadata as any)?.overlay
      if (!overlay) {
        return undefined
      }

      // Convert Kanon overlay format to OCA bundle format
      return this.convertKanonOverlayToOCABundle(overlay, credDefId, language)
    } catch (error) {
      console.warn(`Error fetching credential definition ${credDefId}:`, error)
      return undefined
    }
  }

  /**
   * Convert Kanon overlay format to OCA bundle format
   */
  private convertKanonOverlayToOCABundle(
    overlay: KanonOverlay,
    credDefId: string,
    language?: string
  ): OCABundle {
    const lang = language || 'en'

    // Build capture base
    const captureBase = {
      type: 'spec/capture_base/1.0',
      digest: credDefId,
      classification: overlay.classification || '',
      attributes: overlay.attributes || {},
      flagged_attributes: overlay.flaggedAttributes || [],
    }

    // Build overlays array
    const overlays: any[] = []

    // Meta overlay
    if (overlay.meta) {
      overlays.push({
        type: 'spec/overlays/meta/1.0',
        capture_base: credDefId,
        language: lang,
        name: overlay.meta.name || '',
        description: overlay.meta.description || '',
        issuer: overlay.meta.issuer || '',
        issuer_description: overlay.meta.issuerDescription || '',
        issuer_url: overlay.meta.issuerUrl || '',
        credential_help_text: overlay.meta.credentialHelpText || '',
        credential_support_url: overlay.meta.credentialSupportUrl || '',
      })
    }

    // Label overlay
    if (overlay.labels) {
      overlays.push({
        type: 'spec/overlays/label/1.0',
        capture_base: credDefId,
        language: lang,
        attribute_labels: overlay.labels,
      })
    }

    // Branding overlay
    if (overlay.branding) {
      overlays.push({
        type: 'aries/overlays/branding/0.1',
        capture_base: credDefId,
        language: lang,
        logo: overlay.branding.logo || '',
        background_color: overlay.branding.backgroundColor || '#FFFFFF',
        background_image: overlay.branding.backgroundImage || '',
        background_image_slice: overlay.branding.backgroundImageSlice || '',
        primary_background_color: overlay.branding.primaryBackgroundColor || '',
        secondary_background_color: overlay.branding.secondaryBackgroundColor || '',
        primary_attribute: overlay.branding.primaryAttribute || '',
        secondary_attribute: overlay.branding.secondaryAttribute || '',
        header: overlay.branding.header || { color: '#000000' },
        footer: overlay.branding.footer || { color: '#000000' },
      })
    }

    return {
      captureBase,
      overlays,
    } as OCABundle
  }

  /**
   * Override resolveAllBundles to use our custom resolve
   */
  public async resolveAllBundles(params: OCABundleResolveAllParams): Promise<CredentialOverlay<BrandingOverlay>> {
    const bundle = await this.resolve({
      identifiers: params.identifiers,
      language: params.language,
    })

    if (bundle) {
      return this.processBundle(bundle, params)
    }

    // Fall back to default behavior
    return super.resolveAllBundles(params)
  }

  /**
   * Process a bundle into CredentialOverlay format
   */
  private processBundle(bundle: OCABundle, params: OCABundleResolveAllParams): CredentialOverlay<BrandingOverlay> {
    const lang = params.language || 'en'

    // Extract meta overlay
    const metaOverlay = bundle.overlays?.find(
      (o: any) => o.type === 'spec/overlays/meta/1.0' && o.language === lang
    ) as any

    // Extract label overlay
    const labelOverlay = bundle.overlays?.find(
      (o: any) => o.type === 'spec/overlays/label/1.0' && o.language === lang
    ) as any

    // Extract branding overlay
    const brandingOverlay = bundle.overlays?.find(
      (o: any) => o.type === 'aries/overlays/branding/0.1'
    ) as BrandingOverlay | undefined

    // Build presentation fields with labels
    const presentationFields = params.attributes?.map((attr) => {
      const label = labelOverlay?.attribute_labels?.[attr.name || ''] || attr.name
      return {
        ...attr,
        label,
      }
    })

    return {
      bundle,
      presentationFields,
      metaOverlay: metaOverlay ? {
        name: metaOverlay.name,
        description: metaOverlay.description,
        issuer: metaOverlay.issuer,
        issuerDescription: metaOverlay.issuer_description,
        credentialHelpText: metaOverlay.credential_help_text,
        credentialSupportUrl: metaOverlay.credential_support_url,
      } : undefined,
      brandingOverlay,
    } as CredentialOverlay<BrandingOverlay>
  }
}

/**
 * Kanon overlay format as stored in credential definition
 */
interface KanonOverlay {
  classification?: string
  attributes?: Record<string, string>
  flaggedAttributes?: string[]
  meta?: {
    name?: string
    description?: string
    issuer?: string
    issuerDescription?: string
    issuerUrl?: string
    credentialHelpText?: string
    credentialSupportUrl?: string
  }
  labels?: Record<string, string>
  branding?: {
    logo?: string
    backgroundColor?: string
    backgroundImage?: string
    backgroundImageSlice?: string
    primaryBackgroundColor?: string
    secondaryBackgroundColor?: string
    primaryAttribute?: string
    secondaryAttribute?: string
    header?: { color: string }
    footer?: { color: string }
  }
}
