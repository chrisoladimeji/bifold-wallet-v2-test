import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  DeviceEventEmitter,
  Keyboard,
} from 'react-native'

import {
  useAuth,
  useStore,
  DispatchAction,
  EventTypes,
  testIdWithKey,
} from '@bifold/core'

import { GradientBackground, DigiCredButton, DigiCredLogo, CardModal, DigiCredInput } from '../components'
import { DigiCredColors } from '../theme'

interface PINEnterProps {
  setAuthenticated: (status: boolean) => void
}

const PINEnter: React.FC<PINEnterProps> = ({ setAuthenticated }) => {
  const { t } = useTranslation()
  const { checkWalletPIN, getWalletSecret, isBiometricsActive } = useAuth()
  const [store, dispatch] = useStore()

  const [showPINModal, setShowPINModal] = useState(false)
  const [PIN, setPIN] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [biometricsAvailable, setBiometricsAvailable] = useState(false)
  const isSubmittingRef = useRef(false)

  const minPINLength = 6

  useEffect(() => {
    const checkBiometrics = async () => {
      if (store.preferences.useBiometry) {
        try {
          const active = await isBiometricsActive()
          setBiometricsAvailable(active)
        } catch {
          setBiometricsAvailable(false)
        }
      }
    }
    checkBiometrics()
  }, [store.preferences.useBiometry, isBiometricsActive])

  const unlockWithBiometrics = useCallback(async () => {
    try {
      setIsLoading(true)
      const walletSecret = await getWalletSecret()
      if (walletSecret) {
        dispatch({
          type: DispatchAction.LOCKOUT_UPDATED,
          payload: [{ displayNotification: false }],
        })
        dispatch({
          type: DispatchAction.ATTEMPT_UPDATED,
          payload: [{ loginAttempts: 0 }],
        })
        setAuthenticated(true)
      }
    } catch (err) {
      DeviceEventEmitter.emit(EventTypes.BIOMETRY_ERROR, true)
    } finally {
      setIsLoading(false)
    }
  }, [getWalletSecret, dispatch, setAuthenticated])

  const unlockWithPIN = useCallback(async (pinValue?: string) => {
    const pinToCheck = pinValue || PIN

    if (isSubmittingRef.current || pinToCheck.length < minPINLength) {
      return
    }

    isSubmittingRef.current = true
    Keyboard.dismiss()
    setError(null)

    try {
      setIsLoading(true)
      const result = await checkWalletPIN(pinToCheck)

      if (!result) {
        const newAttempt = store.loginAttempt.loginAttempts + 1
        dispatch({
          type: DispatchAction.ATTEMPT_UPDATED,
          payload: [{ loginAttempts: newAttempt }],
        })
        setError(t('PINEnter.IncorrectPIN'))
        setPIN('')
        setIsLoading(false)
        isSubmittingRef.current = false
        return
      }

      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [{ loginAttempts: 0 }],
      })
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: false }],
      })
      setShowPINModal(false)
      setAuthenticated(true)
    } catch (err) {
      setError(t('PINEnter.IncorrectPIN'))
      isSubmittingRef.current = false
    } finally {
      setIsLoading(false)
    }
  }, [PIN, checkWalletPIN, dispatch, setAuthenticated, store.loginAttempt.loginAttempts, t])

  // Auto-submit when 6 digits entered
  const handlePINChange = useCallback((value: string) => {
    setPIN(value)
    if (value.length === minPINLength) {
      unlockWithPIN(value)
    }
  }, [unlockWithPIN])

  const handleOpenPINModal = () => {
    setPIN('')
    setError(null)
    setShowPINModal(true)
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <DigiCredLogo size="large" />
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
          <DigiCredButton
            title={t('PINEnter.UnlockWithPIN') || 'UNLOCK WITH PIN'}
            onPress={handleOpenPINModal}
            variant="secondary"
            fullWidth
            testID={testIdWithKey('UnlockWithPIN')}
            accessibilityLabel={t('PINEnter.UnlockWithPIN')}
          />

          {(store.preferences.useBiometry && biometricsAvailable) && (
            <>
              <Text style={styles.orText}>{t('PINEnter.Or') || 'OR'}</Text>
              <DigiCredButton
                title={t('PINEnter.UnlockWithBiometrics') || 'UNLOCK WITH BIOMETRICS'}
                onPress={unlockWithBiometrics}
                variant="primary"
                fullWidth
                loading={isLoading && !showPINModal}
                testID={testIdWithKey('UnlockWithBiometrics')}
                accessibilityLabel={t('PINEnter.UnlockWithBiometrics')}
              />
            </>
          )}
        </View>
      </View>

      {/* PIN Entry Modal */}
      <Modal
        visible={showPINModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPINModal(false)}
      >
        <GradientBackground>
          <View style={styles.modalContainer}>
            <CardModal centered>
              <Text style={styles.modalTitle}>
                {t('PINEnter.EnterPIN') || 'Enter Your PIN'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {t('PINEnter.EnterPINDescription') || 'Enter your 6 digit PIN to unlock your wallet'}
              </Text>

              <DigiCredInput
                placeholder={t('PINEnter.PINPlaceholder') || 'Enter PIN'}
                value={PIN}
                onChangeText={handlePINChange}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                autoFocus
                testID={testIdWithKey('EnterPIN')}
                accessibilityLabel={t('PINEnter.EnterPIN')}
              />

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <View style={styles.modalButtons}>
                <DigiCredButton
                  title={t('Global.Cancel') || 'CANCEL'}
                  onPress={() => setShowPINModal(false)}
                  variant="secondary"
                  style={styles.cancelButton}
                />
                <DigiCredButton
                  title={t('PINEnter.Unlock') || 'UNLOCK'}
                  onPress={unlockWithPIN}
                  disabled={PIN.length < minPINLength}
                  loading={isLoading}
                  style={styles.unlockButton}
                />
              </View>
            </CardModal>
          </View>
        </GradientBackground>
      </Modal>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  orText: {
    color: DigiCredColors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
    marginBottom: 12,
  },
  modalSubtitle: {
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  unlockButton: {
    flex: 1,
    marginLeft: 8,
  },
})

export default PINEnter
