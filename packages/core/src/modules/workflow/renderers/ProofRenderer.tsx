/**
 * ProofRenderer
 *
 * Custom renderer for displaying proof requests in chat.
 * Can render as visual cards or default text.
 */

import { ProofExchangeRecord, ProofState } from '@credo-ts/core'
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'

import { useTheme } from '../../../contexts/theme'
import { IProofRenderer, RenderContext } from '../types'

/**
 * Props for the default proof card component
 */
interface ProofCardProps {
  proof: ProofExchangeRecord
  context: RenderContext
  onPress?: () => void
  isLoading?: boolean
}

/**
 * Default proof card component
 * This is a simplified version - can be extended with custom proof display
 */
export const DefaultProofCard: React.FC<ProofCardProps> = ({ proof, context, onPress, isLoading }) => {
  const { SettingsTheme } = useTheme()

  // Determine state label and color
  const getStateInfo = () => {
    switch (proof.state) {
      case ProofState.RequestReceived:
        return {
          label: context.t('ProofRequest.ProofRequest' as any) as string,
          color: SettingsTheme.newSettingColors.buttonColor,
        }
      case ProofState.PresentationSent:
        return {
          label: context.t('ProofRequest.PresentationSent' as any) as string,
          color: '#28a745',
        }
      case ProofState.Done:
        return {
          label: proof.isVerified
            ? (context.t('ProofRequest.Verified' as any) as string)
            : (context.t('ProofRequest.NotVerified' as any) as string),
          color: proof.isVerified ? '#28a745' : '#dc3545',
        }
      case ProofState.Declined:
        return {
          label: context.t('ProofRequest.Declined' as any) as string,
          color: '#dc3545',
        }
      default:
        return {
          label: proof.state,
          color: SettingsTheme.newSettingColors.textColor,
        }
    }
  }

  const stateInfo = getStateInfo()

  const content = (
    <View style={[styles.card, { backgroundColor: 'white' }]}>
      {/* Header with state */}
      <View style={[styles.header, { backgroundColor: stateInfo.color }]}>
        <Text style={styles.headerText}>{stateInfo.label}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {isLoading ? (
          <ActivityIndicator size="small" color={SettingsTheme.newSettingColors.buttonColor} />
        ) : (
          <>
            <Text style={[styles.title, { color: SettingsTheme.newSettingColors.textBody }]}>
              {context.t('ProofRequest.InformationRequest' as any) as string}
            </Text>
            <Text style={[styles.description, { color: SettingsTheme.newSettingColors.textColor }]}>
              {context.theirLabel} {context.t('ProofRequest.RequestsInformation' as any) as string}
            </Text>
            {proof.state === ProofState.RequestReceived && (
              <Text style={[styles.action, { color: SettingsTheme.newSettingColors.buttonColor }]}>
                {context.t('ProofRequest.TapToView' as any) as string}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Bottom accent line */}
      <View style={[styles.bottomLine, { backgroundColor: stateInfo.color }]} />
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    minHeight: 100,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    padding: 12,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
  },
  action: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomLine: {
    height: 4,
  },
})

/**
 * Options for configuring the proof renderer
 */
export interface ProofRendererOptions {
  /** Custom card component to use instead of default */
  CardComponent?: React.FC<ProofCardProps>
  /** Whether to show action buttons (share/decline) */
  showActions?: boolean
  /** Callback when card is pressed */
  onPress?: (proof: ProofExchangeRecord, context: RenderContext) => void
}

/**
 * Default proof renderer class
 */
export class DefaultProofRenderer implements IProofRenderer {
  private options: ProofRendererOptions

  constructor(options: ProofRendererOptions = {}) {
    this.options = options
  }

  render(proof: ProofExchangeRecord, context: RenderContext): React.ReactElement {
    const CardComponent = this.options.CardComponent || DefaultProofCard
    const handlePress = this.options.onPress ? () => this.options.onPress!(proof, context) : undefined

    return <CardComponent proof={proof} context={context} onPress={handlePress} />
  }
}

/**
 * Factory function to create a DefaultProofRenderer
 */
export function createDefaultProofRenderer(options: ProofRendererOptions = {}): DefaultProofRenderer {
  return new DefaultProofRenderer(options)
}
