import React, { useState, forwardRef } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { DigiCredColors } from '../theme'

interface DigiCredInputProps {
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'numeric' | 'email-address'
  maxLength?: number
  style?: ViewStyle
  testID?: string
  accessibilityLabel?: string
  autoFocus?: boolean
}

const DigiCredInput = forwardRef<TextInput, DigiCredInputProps>(({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  style,
  testID,
  accessibilityLabel,
  autoFocus = false,
}, ref) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry)

  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={ref}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={DigiCredColors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        maxLength={maxLength}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
      />
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsSecure(!isSecure)}
          accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
        >
          <Icon
            name={isSecure ? 'eye' : 'eye-off'}
            size={24}
            color={DigiCredColors.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  )
})

DigiCredInput.displayName = 'DigiCredInput'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DigiCredColors.card.backgroundLight,
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DigiCredColors.card.border,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 20,
    fontSize: 16,
    color: DigiCredColors.text.primary,
  },
  eyeButton: {
    padding: 16,
  },
})

export default DigiCredInput
