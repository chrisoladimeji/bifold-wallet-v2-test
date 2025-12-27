import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native'

import {
  useStore,
  DispatchAction,
  useAuth,
  testIdWithKey,
} from '@bifold/core'

import { GradientBackground, CardModal, DigiCredButton, DigiCredToggle } from '../components'
import { DigiCredColors } from '../theme'

const Biometrics: React.FC = () => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const { commitWalletToKeychain, isBiometricsActive } = useAuth()

  const [biometricsEnabled, setBiometricsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = useCallback(async (value: boolean) => {
    if (value) {
      try {
        const available = await isBiometricsActive()
        if (!available) {
          Alert.alert(
            t('Biometry.NotAvailableTitle') || 'Biometrics Not Available',
            t('Biometry.NotAvailableMessage') || 'Biometrics are not available on this device. Please enable them in your device settings.',
            [{ text: t('Global.Okay') || 'OK' }]
          )
          return
        }
        setBiometricsEnabled(true)
      } catch (error) {
        setBiometricsEnabled(false)
      }
    } else {
      setBiometricsEnabled(false)
    }
  }, [isBiometricsActive, t])

  const onContinue = useCallback(async () => {
    setIsLoading(true)
    try {
      // IMPORTANT: Always call commitWalletToKeychain to load wallet secret into AuthContext
      // This is required for Splash screen to initialize the agent
      await commitWalletToKeychain(biometricsEnabled)

      dispatch({
        type: DispatchAction.USE_BIOMETRY,
        payload: [biometricsEnabled],
      })
    } catch (error) {
      // Handle error silently, continue without biometrics
    } finally {
      setIsLoading(false)
    }
  }, [biometricsEnabled, commitWalletToKeychain, dispatch])

  // biometricType available for future use: Platform.OS === 'ios' ? 'Face ID or Touch ID' : 'fingerprint'

  return (
    <GradientBackground>
      <View style={styles.container}>
        <CardModal centered>
          <Text style={styles.title}>
            {t('Biometry.Title') || 'Biometrics'}
          </Text>

          <Text style={styles.bodyText}>
            {t('Biometry.Description') || `The DigiCred wallet defaults to using your biometrics (face recognition or fingerprint) to unlock the application. We use a PIN as a backup if your biometrics are not working. You can use this control to turn off the biometric unlock.`}
          </Text>

          <DigiCredToggle
            label={t('Biometry.Enable') || 'Enable'}
            value={biometricsEnabled}
            onValueChange={handleToggle}
            testID={testIdWithKey('BiometryToggle')}
          />

          <DigiCredButton
            title={t('Global.Continue')}
            onPress={onContinue}
            loading={isLoading}
            testID={testIdWithKey('Continue')}
            accessibilityLabel={t('Global.Continue')}
          />
        </CardModal>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 14,
    color: DigiCredColors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
})

export default Biometrics
