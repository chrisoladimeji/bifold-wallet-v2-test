import { BasicMessageRepository, ConnectionRecord } from '@credo-ts/core'
import { useAgent, useBasicMessagesByConnectionId, useConnectionById } from '@credo-ts/react-hooks'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { useHeaderHeight } from '@react-navigation/elements'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View } from 'react-native'

import InfoIcon from '../components/buttons/InfoIcon'
import { renderComposer, renderInputToolbar, renderSend } from '../components/chat'
import ActionSlider from '../components/chat/ActionSlider'
import { renderActions } from '../components/chat/ChatActions'
import { ChatMessage } from '../components/chat/ChatMessage'
import { useNetwork } from '../contexts/network'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useChatMessagesByConnection } from '../hooks/chat-messages'
import { useOptionalWorkflowRegistry } from '../modules/workflow'
import { ActionContext, WorkflowAction } from '../modules/workflow/types'
import { Role } from '../types/chat'
import { BasicMessageMetadata, basicMessageCustomMetadata } from '../types/metadata'
import { RootStackParams, ContactStackParams, Screens, Stacks } from '../types/navigators'
import { getConnectionName } from '../utils/helpers'
import { KeyboardAvoidingView, Platform } from 'react-native'

type ChatProps = StackScreenProps<ContactStackParams, Screens.Chat> | StackScreenProps<RootStackParams, Screens.Chat>

const Chat: React.FC<ChatProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('Chat route params were not set properly')
  }

  const { connectionId } = route.params
  const [store] = useStore()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const navigation = useNavigation<StackNavigationProp<RootStackParams | ContactStackParams>>()
  const connection = useConnectionById(connectionId) as ConnectionRecord
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
  const chatMessages = useChatMessagesByConnection(connection)
  const isFocused = useIsFocused()
  const { assertNetworkConnected, silentAssertConnectedNetwork } = useNetwork()
  const [showActionSlider, setShowActionSlider] = useState(false)
  const { ChatTheme: theme, Assets } = useTheme()
  const [theirLabel, setTheirLabel] = useState(getConnectionName(connection, store.preferences.alternateContactNames))
  const headerHeight = useHeaderHeight()

  // Try to get the workflow registry for chat actions
  const registry = useOptionalWorkflowRegistry()

  // Get chat screen config from registry
  const chatScreenConfig = useMemo(() => {
    return registry?.getChatScreenConfig()
  }, [registry])

  // This useEffect is for properly rendering changes to the alt contact name, useMemo did not pick them up
  useEffect(() => {
    setTheirLabel(getConnectionName(connection, store.preferences.alternateContactNames))
  }, [isFocused, connection, store.preferences.alternateContactNames])

  useEffect(() => {
    assertNetworkConnected()
  }, [assertNetworkConnected])

  /**
   * Send :menu message to the connection to request the action menu
   * This is the DC wallet bell icon functionality
   */
  const onShowMenu = useCallback(async () => {
    try {
      await agent?.basicMessages.sendMessage(connectionId, ':menu')
    } catch (error) {
      // Error sending menu request - silently fail
    }
  }, [agent, connectionId])

  useEffect(() => {
    // Use custom header from config if available
    if (chatScreenConfig?.headerRenderer) {
      navigation.setOptions({
        header: () =>
          chatScreenConfig.headerRenderer!.render({
            title: theirLabel,
            connectionId: connection?.id,
            onBack: () => navigation.goBack(),
            onInfo: () => {
              navigation.navigate(Screens.ContactDetails as any, { connectionId: connection?.id })
            },
            showMenuButton: chatScreenConfig.showMenuButton,
            showInfoButton: chatScreenConfig.showInfoButton,
            // Bell icon sends :menu message to request action menu from the connection
            onMenuPress: onShowMenu,
          }),
      })
    } else {
      navigation.setOptions({
        title: theirLabel,
        headerRight: () => <InfoIcon connectionId={connection?.id as string} />,
      })
    }
  }, [navigation, theirLabel, connection, chatScreenConfig, onShowMenu])

  // when chat is open, mark messages as seen
  useEffect(() => {
    basicMessages.forEach((msg) => {
      const meta = msg.metadata.get(BasicMessageMetadata.customMetadata) as basicMessageCustomMetadata
      if (agent && !meta?.seen) {
        msg.metadata.set(BasicMessageMetadata.customMetadata, { ...meta, seen: true })
        const basicMessageRepository = agent.context.dependencyManager.resolve(BasicMessageRepository)
        basicMessageRepository.update(agent.context, msg)
      }
    })
  }, [basicMessages, agent])

  const onSend = useCallback(
    async (messages: IMessage[]) => {
      await agent?.basicMessages.sendMessage(connectionId, messages[0].text)
    },
    [agent, connectionId]
  )

  const onSendRequest = useCallback(async () => {
    navigation.navigate(Stacks.ProofRequestsStack as any, {
      screen: Screens.ProofRequests,
      params: { connectionId },
    })
  }, [navigation, connectionId])

  // Create action context for registry
  const actionContext: ActionContext | undefined = useMemo(() => {
    if (!agent) return undefined
    return {
      agent,
      connectionId,
      navigation,
      t,
    }
  }, [agent, connectionId, navigation, t])

  // Get actions from registry if available, otherwise use default actions
  const actions = useMemo(() => {
    const defaultActions: WorkflowAction[] = []

    // Add default Send Proof Request action if verifier capability is enabled
    if (store.preferences.useVerifierCapability) {
      defaultActions.push({
        id: 'send-proof-request',
        text: t('Verifier.SendProofRequest'),
        onPress: () => {
          setShowActionSlider(false)
          onSendRequest()
        },
        icon: () => <Assets.svg.iconInfoSentDark height={30} width={30} />,
      })
    }

    // Get additional actions from registry if available
    if (registry && actionContext) {
      const registryActions = registry.getChatActions(actionContext)
      // Merge registry actions with default actions, avoiding duplicates by ID
      const existingIds = new Set(defaultActions.map((a) => a.id))
      const uniqueRegistryActions = registryActions.filter((a) => !existingIds.has(a.id))
      return [...defaultActions, ...uniqueRegistryActions]
    }

    return defaultActions.length > 0 ? defaultActions : undefined
  }, [store.preferences.useVerifierCapability, t, onSendRequest, Assets, registry, actionContext])

  const onDismiss = useCallback(() => {
    setShowActionSlider(false)
  }, [])

  // Render the chat content
  const chatContent = (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? undefined : 'padding'}
      keyboardVerticalOffset={headerHeight}
    >
      <GiftedChat
        keyboardShouldPersistTaps={'handled'}
        messages={chatMessages}
        showAvatarForEveryMessage={true}
        alignTop
        renderAvatar={() => null}
        messageIdGenerator={(msg) => msg?._id.toString() || '0'}
        renderMessage={(props) => <ChatMessage messageProps={props} />}
        renderInputToolbar={(props) => renderInputToolbar(props, theme)}
        renderSend={(props) => renderSend(props, theme)}
        renderComposer={(props) => renderComposer(props, theme, t('Contacts.TypeHere'))}
        disableComposer={!silentAssertConnectedNetwork()}
        onSend={onSend}
        user={{
          _id: Role.me,
        }}
        renderActions={(props) => renderActions(props, theme, actions as any)}
        onPressActionButton={actions && actions.length > 0 ? () => setShowActionSlider(true) : undefined}
      />
      {showActionSlider && <ActionSlider onDismiss={onDismiss} actions={actions as any} />}
    </KeyboardAvoidingView>
  )

  // Use custom background if available, otherwise use default SafeAreaView
  if (chatScreenConfig?.backgroundRenderer) {
    return (
      <View style={{ flex: 1 }}>
        {chatScreenConfig.backgroundRenderer.render(
          <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, paddingTop: 20 }}>
            {chatContent}
          </SafeAreaView>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, paddingTop: 20 }}>
      {chatContent}
    </SafeAreaView>
  )
}

export default Chat
