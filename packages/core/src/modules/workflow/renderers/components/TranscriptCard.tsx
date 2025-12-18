/**
 * TranscriptCard
 *
 * Custom card component for displaying student transcript information
 * in the chat interface.
 * Ported from bifold-wallet-dc with modular architecture.
 */

import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { SvgUri } from 'react-native-svg'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../../contexts/theme'
import { isTablet } from '../../../../utils/device'

// Import SVG assets
import TranscriptLogo from '../../../../assets/img/TranscriptLogo.svg'
import LogoGraduate from '../../../../assets/img/LogoGraduate.svg'

export interface TranscriptCardProps {
  school?: string
  yearStart?: string
  yearEnd?: string
  termGPA?: string
  cumulativeGPA?: string
  logoImage?: string
  avatarImage?: string
  isInChat?: boolean
  fullname?: string
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  school,
  yearStart,
  yearEnd,
  termGPA,
  cumulativeGPA,
  logoImage,
  avatarImage,
  isInChat = false,
}) => {
  const { t } = useTranslation()
  const { ChatTheme } = useTheme()
  const isTabletDevice = isTablet()
  const aspectRatio = 280 / 175

  // Get transcript card color from theme or use default
  const transcriptCardColor = (ChatTheme as any).newChatDesign?.transcriptCard || '#00477F'

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: transcriptCardColor },
        isInChat
          ? {
              width: isTabletDevice ? 320 : 280,
              height: isTabletDevice ? 215 : 175,
            }
          : {
              width: '100%',
              aspectRatio: aspectRatio,
            },
      ]}
    >
      <View style={styles.leftSection}>
        {logoImage ? (
          <View style={styles.logoImage}>
            <Image source={{ uri: logoImage }} style={{ zIndex: 1, resizeMode: 'contain', width: 96, height: 23 }} />
          </View>
        ) : (
          <LogoGraduate width={50} height={50} />
        )}
        <View style={[styles.infoContainer, { marginTop: isTabletDevice ? 20 : 10 }]}>
          <View style={styles.group1}>
            <Text style={[styles.name, { fontSize: isTabletDevice ? 16 : 12 }]}>{school}</Text>
            <Text style={[styles.name, { fontSize: isTabletDevice ? 16 : 12 }]}>
              {yearStart} - {yearEnd}
            </Text>
          </View>
          <View style={styles.group2}>
            <Text style={styles.details}>
              {t('Chat.TermGPA' as any)} : {termGPA}
            </Text>
            <Text style={styles.details}>
              {t('Chat.CumulativeGPA' as any)}: {cumulativeGPA}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.rightSection}>
        {avatarImage ? (
          <SvgUri uri={avatarImage} width={122} height={160} />
        ) : (
          <TranscriptLogo width={65} height={50} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    flexDirection: 'row',
    padding: 10,
    overflow: 'hidden',
  },
  leftSection: {
    flex: 2,
    paddingRight: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  infoContainer: {
    marginTop: 10,
  },
  name: {
    fontSize: 12,
    color: 'white',
    marginBottom: 5,
  },
  details: {
    fontSize: 12,
    color: 'white',
  },
  barcodeContainer: {
    marginTop: 25,
  },
  rightSection: {
    flex: 1,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  logoImage: {
    justifyContent: 'flex-start',
    marginLeft: '-10%',
  },
  group1: {
    marginBottom: 10,
  },
  group2: {},
})

export default TranscriptCard
