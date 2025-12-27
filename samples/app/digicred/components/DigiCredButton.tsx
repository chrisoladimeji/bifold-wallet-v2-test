import React from 'react'
import { StyleSheet, Text, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native'

import { DigiCredColors } from '../theme'

export type ButtonVariant = 'primary' | 'secondary'

interface DigiCredButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  testID?: string
  accessibilityLabel?: string
  fullWidth?: boolean
}

const DigiCredButton: React.FC<DigiCredButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
  fullWidth = false,
}) => {
  const isPrimary = variant === 'primary'

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={DigiCredColors.text.primary} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            !isPrimary && styles.secondaryButtonText,
            disabled && styles.disabledButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  primaryButton: {
    backgroundColor: DigiCredColors.button.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: DigiCredColors.button.secondaryBorder,
  },
  disabledButton: {
    backgroundColor: DigiCredColors.button.primaryDisabled,
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    color: DigiCredColors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secondaryButtonText: {
    color: DigiCredColors.text.primary,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
})

export default DigiCredButton
