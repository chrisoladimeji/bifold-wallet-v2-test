import {
  BasicMessageRecord,
  ConnectionRecord,
  CredentialExchangeRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@credo-ts/core'
import { useAgent, useBasicMessagesByConnectionId } from '@credo-ts/react-hooks'
import { isPresentationReceived } from '@bifold/verifier'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, View } from 'react-native'

import { ChatEvent } from '../components/chat/ChatEvent'
import { ExtendedChatMessage, CallbackType } from '../components/chat/ChatMessage'
import { ThemedText } from '../components/texts/ThemedText'
import { TOKENS, useContainer } from '../container-api'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useOptionalWorkflowRegistry } from '../modules/workflow'
import { MessageContext } from '../modules/workflow/types'
import { Role } from '../types/chat'
import { RootStackParams, ContactStackParams, Screens, Stacks } from '../types/navigators'
import {
  getConnectionName,
  getCredentialEventLabel,
  getCredentialEventRole,
  getMessageEventRole,
  getProofEventLabel,
  getProofEventRole,
} from '../utils/helpers'

import { useCredentialsByConnectionId } from './credentials'
import { useProofsByConnectionId } from './proofs'
import { useWorkflows } from './useWorkflows'

/**
 * Determines the callback type for a credential or proof record
 * @deprecated Use workflow handlers instead
 */
const callbackTypeForMessage = (record: CredentialExchangeRecord | ProofExchangeRecord) => {
  if (
    record instanceof CredentialExchangeRecord &&
    (record.state === CredentialState.Done || record.state === CredentialState.OfferReceived)
  ) {
    return CallbackType.CredentialOffer
  }

  if (
    (record instanceof ProofExchangeRecord && isPresentationReceived(record) && record.isVerified !== undefined) ||
    record.state === ProofState.RequestReceived ||
    (record.state === ProofState.Done && record.isVerified === undefined)
  ) {
    return CallbackType.ProofRequest
  }

  if (
    record instanceof ProofExchangeRecord &&
    (record.state === ProofState.PresentationSent || record.state === ProofState.Done)
  ) {
    return CallbackType.PresentationSent
  }
}

/**
 * Custom hook for retrieving chat messages for a given connection.
 *
 * If a WorkflowRegistry is available (via WorkflowRegistryProvider), it will use
 * the registered handlers to transform records into messages. Otherwise, it falls
 * back to the legacy implementation.
 *
 * @param {ConnectionRecord} connection - The connection to retrieve chat messages for.
 * @returns {ExtendedChatMessage[]} The chat messages for the given connection.
 */
export const useChatMessagesByConnection = (connection: ConnectionRecord): ExtendedChatMessage[] => {
  const [messages, setMessages] = useState<Array<ExtendedChatMessage>>([])
  const [store] = useStore()
  const { t } = useTranslation()
  const { ChatTheme: theme, ColorPalette } = useTheme()
  const navigation = useNavigation<StackNavigationProp<RootStackParams | ContactStackParams>>()
  const { agent } = useAgent()
  const basicMessages = useBasicMessagesByConnectionId(connection?.id)
  const credentials = useCredentialsByConnectionId(connection?.id)
  const proofs = useProofsByConnectionId(connection?.id)
  const [theirLabel, setTheirLabel] = useState(getConnectionName(connection, store.preferences.alternateContactNames))

  // Get DIDComm workflow instances for this connection
  const { instances: workflowInstances, isAvailable: workflowsAvailable } = useWorkflows(connection?.id)

  // Get logger from container - useContainer returns undefined if not available
  const container = useContainer()
  const logger = container?.resolve(TOKENS.UTIL_LOGGER) ?? undefined

  // Try to get the workflow registry if available
  const registry = useOptionalWorkflowRegistry()

  // This useEffect is for properly rendering changes to the alt contact name
  useEffect(() => {
    setTheirLabel(getConnectionName(connection, store.preferences.alternateContactNames))
  }, [connection, store.preferences.alternateContactNames])

  // Create message context for handlers
  const messageContext: MessageContext = useMemo(
    () => ({
      t,
      theme,
      theirLabel,
      colorPalette: ColorPalette,
      agent: agent ?? undefined,
      navigation,
      logger,
    }),
    [t, theme, theirLabel, ColorPalette, agent, navigation, logger]
  )

  useEffect(() => {
    let transformedMessages: Array<ExtendedChatMessage> = []

    // If registry is available, use it
    if (registry) {
      // Include DIDComm workflow instances if available
      const allRecords = [
        ...basicMessages,
        ...credentials,
        ...proofs,
        ...(workflowsAvailable ? workflowInstances : []),
      ]
      transformedMessages = registry.toMessages(allRecords, connection, messageContext)
    } else {
      // Fallback to legacy implementation
      transformedMessages = transformMessagesLegacy(
        basicMessages,
        credentials,
        proofs,
        theirLabel,
        t,
        theme,
        ColorPalette,
        navigation
      )
    }

    // Add connected message
    const connectedBubbleStyle = {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: ColorPalette.brand.primary,
      maxWidth: 280,
    }

    const connectedMessage = connection
      ? {
          _id: 'connected',
          text: `${t('Chat.YouConnected')} ${theirLabel}`,
          renderEvent: () => (
            <View style={connectedBubbleStyle}>
              <ThemedText style={theme.rightText}>
                {t('Chat.YouConnected')}
                <ThemedText style={[theme.rightText, theme.rightTextHighlighted]}> {theirLabel}</ThemedText>
              </ThemedText>
            </View>
          ),
          createdAt: connection.createdAt,
          user: { _id: Role.me },
        }
      : undefined

    const finalMessages = connectedMessage
      ? [...transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt), connectedMessage]
      : transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt)

    setMessages(finalMessages)
  }, [ColorPalette, basicMessages, theme, credentials, t, navigation, proofs, theirLabel, connection, registry, messageContext, workflowInstances, workflowsAvailable])

  return messages
}

/**
 * Legacy message transformation (for backwards compatibility)
 * @deprecated Use workflow handlers instead
 */
function transformMessagesLegacy(
  basicMessages: BasicMessageRecord[],
  credentials: CredentialExchangeRecord[],
  proofs: ProofExchangeRecord[],
  theirLabel: string,
  t: any,
  theme: any,
  ColorPalette: any,
  navigation: StackNavigationProp<RootStackParams | ContactStackParams>
): ExtendedChatMessage[] {
  const transformedMessages: Array<ExtendedChatMessage> = []

  // Transform basic messages
  transformedMessages.push(
    ...basicMessages.map((record: BasicMessageRecord) => {
      const role = getMessageEventRole(record)
      const linkRegex = /(?:https?:\/\/\w+(?:\.\w+)+\S*)|(?:[\w\d._-]+@\w+(?:\.\w+)+)/gim
      const mailRegex = /^[\w\d._-]+@\w+(?:\.\w+)+$/gim
      const links = record.content.match(linkRegex) ?? []
      const handleLinkPress = (link: string) => {
        if (link.match(mailRegex)) {
          link = 'mailto:' + link
        }
        Linking.openURL(link)
      }
      const msgText = (
        <ThemedText style={role === Role.me ? theme.rightText : theme.leftText}>
          {record.content.split(linkRegex).map((split: string, i: number) => {
            if (i < links.length) {
              const link = links[i]
              return (
                <Fragment key={`${record.id}-${i}`}>
                  <ThemedText>{split}</ThemedText>
                  <ThemedText
                    onPress={() => handleLinkPress(link)}
                    style={{ color: ColorPalette.brand.link, textDecorationLine: 'underline' }}
                    accessibilityRole={'link'}
                  >
                    {link}
                  </ThemedText>
                </Fragment>
              )
            }
            return <ThemedText key={`${record.id}-${i}`}>{split}</ThemedText>
          })}
        </ThemedText>
      )

      return {
        _id: record.id,
        text: record.content,
        renderEvent: () => msgText,
        createdAt: record.createdAt,
        type: record.type,
        user: { _id: role },
      }
    })
  )

  // Transform credential messages
  transformedMessages.push(
    ...credentials.map((record: CredentialExchangeRecord) => {
      const role = getCredentialEventRole(record)
      const userLabel = role === Role.me ? t('Chat.UserYou') : theirLabel
      const actionLabel = t(getCredentialEventLabel(record) as any)

      return {
        _id: record.id,
        text: actionLabel,
        renderEvent: () => <ChatEvent role={role} userLabel={userLabel} actionLabel={actionLabel} />,
        createdAt: record.createdAt,
        type: record.type,
        user: { _id: role },
        messageOpensCallbackType: callbackTypeForMessage(record),
        onDetails: () => {
          const navMap: { [key in CredentialState]?: () => void } = {
            [CredentialState.Done]: () => {
              navigation.navigate(Stacks.ContactStack as any, {
                screen: Screens.CredentialDetails,
                params: { credentialId: record.id },
              })
            },
            [CredentialState.OfferReceived]: () => {
              if (navigation.getParent()) {
                navigation.getParent()?.navigate(Stacks.ConnectionStack, {
                  screen: Screens.Connection,
                  params: { credentialId: record.id },
                })
              } else {
                navigation.navigate(Stacks.ConnectionStack as any, {
                  screen: Screens.Connection,
                  params: { credentialId: record.id },
                })
              }
            },
          }
          const nav = navMap[record.state]
          if (nav) {
            nav()
          }
        },
      }
    })
  )

  // Transform proof messages
  transformedMessages.push(
    ...proofs.map((record: ProofExchangeRecord) => {
      const role = getProofEventRole(record)
      const userLabel = role === Role.me ? t('Chat.UserYou') : theirLabel
      const actionLabel = t(getProofEventLabel(record) as any)

      return {
        _id: record.id,
        text: actionLabel,
        renderEvent: () => <ChatEvent role={role} userLabel={userLabel} actionLabel={actionLabel} />,
        createdAt: record.createdAt,
        type: record.type,
        user: { _id: role },
        messageOpensCallbackType: callbackTypeForMessage(record),
        onDetails: () => {
          const toProofDetails = () => {
            navigation.navigate(Stacks.ContactStack as any, {
              screen: Screens.ProofDetails,
              params: {
                recordId: record.id,
                isHistory: true,
                senderReview:
                  record.state === ProofState.PresentationSent ||
                  (record.state === ProofState.Done && record.isVerified === undefined),
              },
            })
          }
          const navMap: { [key in ProofState]?: () => void } = {
            [ProofState.Done]: toProofDetails,
            [ProofState.PresentationSent]: toProofDetails,
            [ProofState.PresentationReceived]: toProofDetails,
            [ProofState.RequestReceived]: () => {
              if (navigation.getParent()) {
                navigation.getParent()?.navigate(Stacks.ConnectionStack, {
                  screen: Screens.Connection,
                  params: { proofId: record.id },
                })
              } else {
                navigation.navigate(Stacks.ConnectionStack as any, {
                  screen: Screens.Connection,
                  params: { proofId: record.id },
                })
              }
            },
          }
          const nav = navMap[record.state]
          if (nav) {
            nav()
          }
        },
      }
    })
  )

  return transformedMessages
}
