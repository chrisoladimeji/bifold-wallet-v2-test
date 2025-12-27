import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import {
  useStore,
  DispatchAction,
  testIdWithKey,
} from '@bifold/core'

import { GradientBackground, CardModal, DigiCredButton } from '../components'
import { DigiCredColors } from '../theme'

export const TermsVersion = '1.0'

const Terms: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  useNavigation<StackNavigationProp<Record<string, object | undefined>>>() // Navigation available if needed
  const [checked, setChecked] = useState(false)

  const agreedToPreviousTerms = store.onboarding.didAgreeToTerms

  const onSubmitPressed = useCallback(() => {
    dispatch({
      type: DispatchAction.DID_AGREE_TO_TERMS,
      payload: [{ DidAgreeToTerms: TermsVersion }],
    })
  }, [dispatch])

  return (
    <GradientBackground>
      <View style={styles.container}>
        <CardModal style={styles.card} fullHeight>
          <Text style={styles.title}>
            {t('Terms.Title') || 'Terms And Conditions'}
          </Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
          >
            <Text style={styles.highlightText}>
              {t('Terms.Intro') || 'Please agree to the terms and conditions below before using this application.'}
            </Text>

            <Text style={styles.bodyText}>
              {t('Terms.BodyIntro') || 'These terms and conditions (Terms) govern your use of the DigiCred Mobile Wallet ("App"), developed by DigiCred Holdings Inc. ("Developer"). By downloading, installing, or using the App, you agree to be bound by these Terms. If you do not agree to these Terms, do not use this App.'}
            </Text>

            <Text style={styles.sectionTitle}>
              {t('Terms.DefinitionsTitle') || 'Definitions'}
            </Text>
            <Text style={styles.bodyText}>
              {t('Terms.DefinitionsBody') || '"User" refers to any person who downloads, installs, or uses the App. "Content" refers to any text, images, or other media through the App.'}
            </Text>

            <Text style={styles.sectionTitle}>
              {t('Terms.LicenseTitle') || 'License'}
            </Text>
            <Text style={styles.bodyText}>
              {t('Terms.LicenseBody') || 'Subject to your compliance with these Terms, the Developer Grants you a limited non-exclusive, non-transferrable, revocable license to download, install, and use the App for your personal, non-commercial purposes.'}
            </Text>

            <Text style={styles.sectionTitle}>
              {t('Terms.PrivacyTitle') || 'Privacy'}
            </Text>
            <Text style={styles.bodyText}>
              {t('Terms.PrivacyBody') || 'Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information when you use the App.'}
            </Text>

            <Text style={styles.sectionTitle}>
              {t('Terms.DisclaimerTitle') || 'Disclaimer'}
            </Text>
            <Text style={styles.bodyText}>
              {t('Terms.DisclaimerBody') || 'The App is provided "as is" without warranties of any kind. The Developer disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.'}
            </Text>
          </ScrollView>

          {!agreedToPreviousTerms && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setChecked(!checked)}
              testID={testIdWithKey('IAgree')}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
            >
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && (
                  <Icon name="check" size={16} color={DigiCredColors.text.primary} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {t('Terms.Attestation') || 'I have read, understand and accept the terms and conditions.'}
              </Text>
            </TouchableOpacity>
          )}

          <DigiCredButton
            title={agreedToPreviousTerms ? t('Global.Accept') : t('Global.Continue')}
            onPress={onSubmitPressed}
            disabled={!checked && !agreedToPreviousTerms}
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
  },
  card: {
    marginTop: 40,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    marginBottom: 16,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '600',
    color: DigiCredColors.text.highlight,
    lineHeight: 20,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 14,
    color: DigiCredColors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
    marginBottom: 8,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: DigiCredColors.card.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: DigiCredColors.button.primary,
    borderColor: DigiCredColors.button.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: DigiCredColors.text.secondary,
    lineHeight: 20,
  },
})

export default Terms
