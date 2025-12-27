import React, { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Text,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  DeviceEventEmitter,
  TextInput,
} from 'react-native'
import { ParamListBase } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'

import {
  useAuth,
  useStore,
  DispatchAction,
  Screens,
  BifoldError,
  EventTypes,
  testIdWithKey,
} from '@bifold/core'

import { GradientBackground, CardModal, DigiCredButton, DigiCredInput } from '../components'
import { DigiCredColors } from '../theme'

interface PINCreateProps extends StackScreenProps<ParamListBase, Screens.CreatePIN> {
  setAuthenticated: (status: boolean) => void
}

const PINCreate: React.FC<PINCreateProps> = ({ setAuthenticated }) => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const { setPIN: setWalletPIN } = useAuth()

  const [PIN, setPIN] = useState('')
  const [PINConfirm, setPINConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmInputRef = useRef<TextInput>(null)
  const isSubmittingRef = useRef(false)

  const minPINLength = 6

  const passcodeCreate = useCallback(
    async (pin: string) => {
      if (isSubmittingRef.current) return
      isSubmittingRef.current = true

      try {
        setIsLoading(true)
        Keyboard.dismiss()
        await setWalletPIN(pin)
        setAuthenticated(true)
        dispatch({
          type: DispatchAction.DID_CREATE_PIN,
        })
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1040'),
          t('Error.Message1040'),
          (err as Error)?.message ?? err,
          1040
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        isSubmittingRef.current = false
      } finally {
        setIsLoading(false)
      }
    },
    [setWalletPIN, setAuthenticated, dispatch, t]
  )

  // Handle first PIN input change - auto advance to confirm field
  const handlePINChange = useCallback((value: string) => {
    setPIN(value)
    setError(null)
    if (value.length === minPINLength) {
      // Auto-advance to confirm field
      setTimeout(() => {
        confirmInputRef.current?.focus()
      }, 100)
    }
  }, [])

  // Handle confirm PIN input change - auto submit when complete and matching
  const handlePINConfirmChange = useCallback((value: string) => {
    setPINConfirm(value)
    setError(null)
    if (value.length === minPINLength && PIN.length === minPINLength) {
      if (value === PIN) {
        // PINs match, auto-submit
        passcodeCreate(PIN)
      } else {
        // PINs don't match
        setError(t('PINCreate.PINsDoNotMatch'))
      }
    }
  }, [PIN, passcodeCreate, t])

  const handleContinue = useCallback(async () => {
    Keyboard.dismiss()
    setError(null)

    if (PIN.length < minPINLength) {
      setError(t('PINCreate.PINTooShort'))
      return
    }

    if (PIN !== PINConfirm) {
      setError(t('PINCreate.PINsDoNotMatch'))
      return
    }

    await passcodeCreate(PIN)
  }, [PIN, PINConfirm, passcodeCreate, t])

  const isButtonDisabled = isLoading || PIN.length < minPINLength || PINConfirm.length < minPINLength

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <CardModal centered>
            <Text style={styles.title}>
              {t('PINCreate.CardTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {t('PINCreate.CardSubtitle')}
            </Text>

            <DigiCredInput
              placeholder={t('PINCreate.EnterPINPlaceholder')}
              value={PIN}
              onChangeText={handlePINChange}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              autoFocus
              testID={testIdWithKey('EnterPIN')}
              accessibilityLabel={t('PINCreate.EnterPIN')}
            />

            <DigiCredInput
              ref={confirmInputRef}
              placeholder={t('PINCreate.ReenterPINPlaceholder')}
              value={PINConfirm}
              onChangeText={handlePINConfirmChange}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              testID={testIdWithKey('ReenterPIN')}
              accessibilityLabel={t('PINCreate.ReenterPIN')}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <DigiCredButton
              title={t('Global.Continue')}
              onPress={handleContinue}
              disabled={isButtonDisabled}
              loading={isLoading}
              testID={testIdWithKey('Continue')}
              accessibilityLabel={t('Global.Continue')}
            />
          </CardModal>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: DigiCredColors.text.secondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    color: DigiCredColors.text.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
})

export default PINCreate
