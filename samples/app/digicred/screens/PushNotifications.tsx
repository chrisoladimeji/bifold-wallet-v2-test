import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import {
  useStore,
  DispatchAction,
  testIdWithKey,
} from '@bifold/core'

import { GradientBackground, CardModal, DigiCredButton, DigiCredToggle } from '../components'
import { DigiCredColors } from '../theme'

const PushNotifications: React.FC = () => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  useNavigation<StackNavigationProp<Record<string, object | undefined>>>() // Navigation available if needed

  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const bulletPoints = [
    t('PushNotifications.BulletOne') || 'New credential offers',
    t('PushNotifications.BulletTwo') || 'New proof requests',
    t('PushNotifications.BulletThree') || 'Updates to your credentials',
    t('PushNotifications.BulletFour') || 'New messages',
  ]

  const handleToggle = useCallback((value: boolean) => {
    setNotificationsEnabled(value)
  }, [])

  const onContinue = useCallback(async () => {
    setIsLoading(true)
    try {
      dispatch({
        type: DispatchAction.USE_PUSH_NOTIFICATIONS,
        payload: [notificationsEnabled],
      })
      dispatch({
        type: DispatchAction.DID_CONSIDER_PUSH_NOTIFICATIONS,
      })
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }, [notificationsEnabled, dispatch])

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.spacer} />

        <CardModal>
          <Text style={styles.title}>
            {t('PushNotifications.Title') || 'Use Push Notifications'}
          </Text>

          <Text style={styles.subtitle}>
            {t('PushNotifications.Subtitle') || 'Be notified when you receive:'}
          </Text>

          <View style={styles.bulletList}>
            {bulletPoints.map((item, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <DigiCredToggle
            label={t('PushNotifications.Enable') || 'Enable'}
            value={notificationsEnabled}
            onValueChange={handleToggle}
            testID={testIdWithKey('PushNotificationToggle')}
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
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
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
    marginBottom: 16,
  },
  bulletList: {
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    color: DigiCredColors.text.primary,
    fontSize: 14,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    color: DigiCredColors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
})

export default PushNotifications
