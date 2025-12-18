/**
 * CredentialRenderer
 *
 * Custom renderer for displaying credentials in chat.
 * Can render as visual cards (VDCard, TranscriptCard) or default text.
 */

import { CredentialExchangeRecord, CredentialState } from '@credo-ts/core'
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import { useTheme } from '../../../contexts/theme'
import { ICredentialRenderer, RenderContext } from '../types'
import { VDCard } from './components/VDCard'
import { TranscriptCard } from './components/TranscriptCard'

/**
 * Determine credential type based on credential definition ID
 */
export enum CredentialDisplayType {
  STUDENT_ID = 'student_id',
  TRANSCRIPT = 'transcript',
  DEFAULT = 'default',
}

/**
 * Detect credential type from credential definition ID or attributes
 */
export function detectCredentialType(credential: CredentialExchangeRecord): CredentialDisplayType {
  const credDefId = (credential as any).metadata?.data?.['_anoncreds/credential']?.credentialDefinitionId || ''
  const credentialAttributes = credential.credentialAttributes || []

  // Check for transcript attributes
  const hasGPA = credentialAttributes.some(
    (attr) =>
      attr.name.toLowerCase().includes('gpa') ||
      attr.name.toLowerCase().includes('termgpa') ||
      attr.name.toLowerCase().includes('cumulativegpa')
  )
  const hasYearStart = credentialAttributes.some(
    (attr) => attr.name.toLowerCase() === 'yearstart' || attr.name.toLowerCase() === 'year_start'
  )

  if (hasGPA || hasYearStart || credDefId.toLowerCase().includes('transcript')) {
    return CredentialDisplayType.TRANSCRIPT
  }

  // Check for student ID attributes
  const hasStudentId = credentialAttributes.some(
    (attr) =>
      attr.name.toLowerCase() === 'studentid' ||
      attr.name.toLowerCase() === 'studentnumber' ||
      attr.name.toLowerCase() === 'student_id'
  )
  const hasStudentName = credentialAttributes.some(
    (attr) =>
      attr.name.toLowerCase() === 'fullname' ||
      attr.name.toLowerCase() === 'studentfullname' ||
      (attr.name.toLowerCase() === 'first' || attr.name.toLowerCase() === 'last')
  )

  if (hasStudentId && hasStudentName) {
    return CredentialDisplayType.STUDENT_ID
  }

  // Check credDefId for known patterns
  if (
    credDefId.includes('NHCS') ||
    credDefId.includes('PCS') ||
    credDefId.includes('M-DCPS') ||
    credDefId.includes('CFCC') ||
    credDefId.includes('Pender') ||
    credDefId.includes('Miami') ||
    credDefId.includes('Hanover')
  ) {
    return CredentialDisplayType.STUDENT_ID
  }

  return CredentialDisplayType.DEFAULT
}

/**
 * Props for the default credential card component
 */
interface CredentialCardProps {
  credential: CredentialExchangeRecord
  context: RenderContext
  onPress?: () => void
}

/**
 * Default credential card component
 * This is a simplified version - can be extended with VDCard, TranscriptCard etc.
 */
export const DefaultCredentialCard: React.FC<CredentialCardProps> = ({ credential, context, onPress }) => {
  const { SettingsTheme } = useTheme()

  // Extract basic credential info
  const credentialAttributes = credential.credentialAttributes || []
  const fullName = credentialAttributes.find(
    (attr) => attr.name.toLowerCase() === 'fullname' || attr.name.toLowerCase() === 'studentfullname'
  )?.value
  const firstName = credentialAttributes.find((attr) => attr.name.toLowerCase() === 'first')?.value
  const lastName = credentialAttributes.find((attr) => attr.name.toLowerCase() === 'last')?.value
  const studentId = credentialAttributes.find(
    (attr) => attr.name.toLowerCase() === 'studentid' || attr.name.toLowerCase() === 'studentnumber'
  )?.value
  const school = credentialAttributes.find((attr) => attr.name.toLowerCase() === 'schoolname')?.value

  const displayName = fullName || (firstName && lastName ? `${firstName} ${lastName}` : 'Unknown')

  // Determine state label
  const getStateLabel = () => {
    switch (credential.state) {
      case CredentialState.OfferReceived:
        return context.t('CredentialOffer.CredentialOffer')
      case CredentialState.Done:
        return context.t('Credentials.Credential')
      case CredentialState.Declined:
        return context.t('CredentialOffer.Declined')
      default:
        return credential.state
    }
  }

  const content = (
    <View style={[styles.card, { backgroundColor: 'white' }]}>
      {/* Header with state */}
      <View style={[styles.header, { backgroundColor: SettingsTheme.newSettingColors.buttonColor }]}>
        <Text style={styles.headerText}>{getStateLabel()}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {school && <Text style={[styles.school, { color: SettingsTheme.newSettingColors.headerTitle }]}>{school}</Text>}
        <Text style={[styles.name, { color: SettingsTheme.newSettingColors.textBody }]}>{displayName}</Text>
        {studentId && (
          <Text style={[styles.detail, { color: SettingsTheme.newSettingColors.textColor }]}>
            {context.t('Chat.StudentID' as any) as string}: {studentId}
          </Text>
        )}
      </View>

      {/* Bottom accent line */}
      <View style={[styles.bottomLine, { backgroundColor: SettingsTheme.newSettingColors.buttonColor }]} />
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
    minHeight: 120,
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
  },
  school: {
    fontSize: 10,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detail: {
    fontSize: 12,
    marginBottom: 2,
  },
  bottomLine: {
    height: 4,
  },
})

/**
 * Options for configuring the credential renderer
 */
export interface CredentialRendererOptions {
  /** Custom card component to use instead of default */
  CardComponent?: React.FC<CredentialCardProps>
  /** Whether to show action buttons (accept/decline) */
  showActions?: boolean
  /** Callback when card is pressed */
  onPress?: (credential: CredentialExchangeRecord, context: RenderContext) => void
}

/**
 * Default credential renderer class
 */
export class DefaultCredentialRenderer implements ICredentialRenderer {
  private options: CredentialRendererOptions

  constructor(options: CredentialRendererOptions = {}) {
    this.options = options
  }

  render(credential: CredentialExchangeRecord, context: RenderContext): React.ReactElement {
    const CardComponent = this.options.CardComponent || DefaultCredentialCard
    const handlePress = this.options.onPress ? () => this.options.onPress!(credential, context) : undefined

    return <CardComponent credential={credential} context={context} onPress={handlePress} />
  }
}

/**
 * Factory function to create a DefaultCredentialRenderer
 */
export function createDefaultCredentialRenderer(options: CredentialRendererOptions = {}): DefaultCredentialRenderer {
  return new DefaultCredentialRenderer(options)
}

/**
 * Helper function to extract credential attributes
 */
function getAttributeValue(credential: CredentialExchangeRecord, ...names: string[]): string | undefined {
  const attrs = credential.credentialAttributes || []
  for (const name of names) {
    const attr = attrs.find((a) => a.name.toLowerCase() === name.toLowerCase())
    if (attr?.value) return attr.value
  }
  return undefined
}

/**
 * VD-style Credential Card Component
 * Automatically chooses between VDCard, TranscriptCard, or Default based on credential type
 */
export const VDCredentialCard: React.FC<CredentialCardProps> = ({ credential, context, onPress }) => {
  const credentialType = detectCredentialType(credential)
  const credDefId = (credential as any).metadata?.data?.['_anoncreds/credential']?.credentialDefinitionId || ''

  // Extract common attributes
  const firstName = getAttributeValue(credential, 'first', 'firstname', 'first_name') || ''
  const lastName = getAttributeValue(credential, 'last', 'lastname', 'last_name') || ''
  const fullName = getAttributeValue(credential, 'fullname', 'studentfullname', 'full_name')
  const studentId = getAttributeValue(credential, 'studentid', 'studentnumber', 'student_id') || ''
  const school = getAttributeValue(credential, 'schoolname', 'school', 'institution')
  const issueDate = getAttributeValue(credential, 'issuedate', 'issue_date', 'expirationdate', 'expiration_date') || ''
  const studentPhoto = getAttributeValue(credential, 'studentphoto', 'photo', 'student_photo')

  // Transcript-specific attributes
  const yearStart = getAttributeValue(credential, 'yearstart', 'year_start')
  const yearEnd = getAttributeValue(credential, 'yearend', 'year_end')
  const termGPA = getAttributeValue(credential, 'termgpa', 'term_gpa')
  const cumulativeGPA = getAttributeValue(credential, 'cumulativegpa', 'cumulative_gpa')

  const handlePress = () => {
    if (onPress) {
      onPress()
    }
  }

  const renderCard = () => {
    switch (credentialType) {
      case CredentialDisplayType.STUDENT_ID:
        return (
          <VDCard
            firstName={firstName}
            lastName={lastName}
            fullName={fullName}
            studentId={studentId}
            school={school}
            issueDate={issueDate}
            credDefId={credDefId}
            issuerName={context.theirLabel}
            isInChat={context.isInChat}
            studentPhoto={studentPhoto}
          />
        )

      case CredentialDisplayType.TRANSCRIPT:
        return (
          <TranscriptCard
            school={school}
            yearStart={yearStart}
            yearEnd={yearEnd}
            termGPA={termGPA}
            cumulativeGPA={cumulativeGPA}
            fullname={fullName || `${firstName} ${lastName}`}
            isInChat={context.isInChat}
          />
        )

      default:
        return <DefaultCredentialCard credential={credential} context={context} />
    }
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        {renderCard()}
      </TouchableOpacity>
    )
  }

  return renderCard()
}

/**
 * Options for VD-style credential renderer
 */
export interface VDCredentialRendererOptions {
  /** Callback when card is pressed */
  onPress?: (credential: CredentialExchangeRecord, context: RenderContext) => void
  /** Force a specific display type */
  forceDisplayType?: CredentialDisplayType
}

/**
 * VD-style credential renderer class
 * Automatically displays appropriate card based on credential type
 */
export class VDCredentialRenderer implements ICredentialRenderer {
  private options: VDCredentialRendererOptions

  constructor(options: VDCredentialRendererOptions = {}) {
    this.options = options
  }

  render(credential: CredentialExchangeRecord, context: RenderContext): React.ReactElement {
    const handlePress = this.options.onPress ? () => this.options.onPress!(credential, context) : undefined

    return <VDCredentialCard credential={credential} context={context} onPress={handlePress} />
  }
}

/**
 * Factory function to create a VDCredentialRenderer
 */
export function createVDCredentialRenderer(options: VDCredentialRendererOptions = {}): VDCredentialRenderer {
  return new VDCredentialRenderer(options)
}
