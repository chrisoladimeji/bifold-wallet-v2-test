import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { DigiCredColors } from '../theme'

interface CardModalProps {
  children: React.ReactNode
  style?: ViewStyle
  fullHeight?: boolean
  centered?: boolean
}

const CardModal: React.FC<CardModalProps> = ({ children, style, fullHeight = false, centered = false }) => {
  return (
    <View style={[styles.card, fullHeight && styles.fullHeight, centered && styles.centered, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DigiCredColors.card.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  fullHeight: {
    flex: 1,
    marginTop: 60,
  },
  centered: {
    borderRadius: 24,
  },
})

export default CardModal
