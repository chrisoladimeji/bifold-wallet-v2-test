/**
 * ActionMenuWorkflowHandler
 *
 * Handles action menu messages (JSON with displayData) in the chat interface.
 * Ported from bifold-wallet-1.
 */

import { Agent, BasicMessageRecord, ConnectionRecord } from '@credo-ts/core'
import { BasicMessageRole } from '@credo-ts/core/build/modules/basic-messages/BasicMessageRole'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { Alert } from 'react-native'
import { TFunction } from 'react-i18next'

import { CallbackType, ExtendedChatMessage } from '../../../components/chat/ChatMessage'
import { Role } from '../../../types/chat'
import { Screens, RootStackParams, ContactStackParams } from '../../../types/navigators'
import { connectFromScanOrDeepLink } from '../../../utils/helpers'
import { BifoldLogger } from '../../../services/logger'
import {
  ActionContext,
  ActionMenuContentItem,
  ActionMenuMessage,
  MessageContext,
  NavigationResult,
  WorkflowAction,
  WorkflowType,
} from '../types'

import { ActionMenuBubble } from './components/ActionMenuBubble'
import { BaseWorkflowHandler } from './BaseWorkflowHandler'

/**
 * Extended BasicMessageRecord with parsed action menu data
 */
interface ActionMenuRecord extends BasicMessageRecord {
  _parsedActionMenu?: ActionMenuMessage
}

export class ActionMenuWorkflowHandler extends BaseWorkflowHandler<ActionMenuRecord> {
  readonly type = WorkflowType.ActionMenu
  readonly displayName = 'Action Menu'

  private agent?: Agent
  private connectionId?: string
  private navigation?: StackNavigationProp<RootStackParams | ContactStackParams>
  private logger?: BifoldLogger
  private t?: TFunction

  /**
   * Set the agent instance for sending messages
   */
  setAgent(agent: Agent): void {
    this.agent = agent
  }

  /**
   * Set the connection ID for sending messages
   */
  setConnectionId(connectionId: string): void {
    this.connectionId = connectionId
  }

  /**
   * Set navigation for routing after invitation connections
   */
  setNavigation(navigation: StackNavigationProp<RootStackParams | ContactStackParams>): void {
    this.navigation = navigation
  }

  /**
   * Set logger instance for error logging
   */
  setLogger(logger: BifoldLogger): void {
    this.logger = logger
  }

  /**
   * Set translation function for localized messages
   */
  setTranslation(t: TFunction): void {
    this.t = t
  }

  /**
   * Configure the handler with all dependencies at once
   */
  configure(config: {
    agent: Agent
    connectionId: string
    navigation?: StackNavigationProp<RootStackParams | ContactStackParams>
    logger?: BifoldLogger
    t?: TFunction
  }): void {
    this.agent = config.agent
    this.connectionId = config.connectionId
    this.navigation = config.navigation
    this.logger = config.logger
    this.t = config.t
  }

  canHandle(record: unknown): record is ActionMenuRecord {
    if (!(record instanceof BasicMessageRecord)) {
      return false
    }

    // Check if it's an action menu message (JSON with displayData)
    const parsed = this.parseActionMenu(record)
    if (parsed) {
      // Attach parsed data to record for later use
      ;(record as ActionMenuRecord)._parsedActionMenu = parsed
      return true
    }

    return false
  }

  getRole(record: ActionMenuRecord): Role {
    return record.role === BasicMessageRole.Sender ? Role.me : Role.them
  }

  getLabel(record: ActionMenuRecord, _t: TFunction): string {
    const parsed = record._parsedActionMenu ?? this.parseActionMenu(record)
    if (parsed) {
      // Find title in displayData
      const titleItem = parsed.displayData.find((item) => item.type === 'title')
      return titleItem?.text ?? 'Action Menu'
    }
    return 'Action Menu'
  }

  getCallbackType(_record: ActionMenuRecord): CallbackType | undefined {
    // Action menus have their own buttons, no need for callback type
    return undefined
  }

  toMessage(record: ActionMenuRecord, connection: ConnectionRecord, context: MessageContext): ExtendedChatMessage {
    const parsed = record._parsedActionMenu ?? this.parseActionMenu(record)

    // Configure handler from context if not manually configured
    if (context.agent && !this.agent) {
      this.agent = context.agent
    }
    if (connection?.id && !this.connectionId) {
      this.connectionId = connection.id
    }
    if (context.navigation && !this.navigation) {
      this.navigation = context.navigation as StackNavigationProp<RootStackParams | ContactStackParams>
    }
    if (context.logger && !this.logger) {
      this.logger = context.logger
    }
    if (context.t && !this.t) {
      this.t = context.t
    }

    if (!parsed) {
      // Fallback to basic text if parsing fails
      return {
        _id: record.id,
        text: record.content,
        renderEvent: () => <></>,
        createdAt: record.createdAt,
        user: { _id: this.getRole(record) },
        messageOpensCallbackType: undefined,
        onDetails: undefined,
      }
    }

    const renderEvent = () => (
      <ActionMenuBubble
        content={parsed.displayData}
        workflowID={parsed.workflowID}
        onActionPress={this.handleActionButtonPress.bind(this)}
      />
    )

    return {
      _id: record.id,
      text: this.getLabel(record, context.t),
      renderEvent,
      createdAt: record.createdAt,
      user: { _id: this.getRole(record) },
      messageOpensCallbackType: undefined,
      onDetails: undefined,
    }
  }

  getDetailNavigation(
    _record: ActionMenuRecord,
    _navigation: StackNavigationProp<any>
  ): NavigationResult | undefined {
    // Action menus handle their own navigation via buttons
    return undefined
  }

  shouldDisplay(record: ActionMenuRecord): boolean {
    // Only show action menus from the other party (them)
    return this.getRole(record) === Role.them
  }

  /**
   * Handle action button press in the action menu
   */
  async handleActionButtonPress(actionId: string, workflowID: string, invitationLink?: string): Promise<void> {
    if (!this.agent || !this.connectionId) {
      console.warn('Agent or connectionId not set for ActionMenuHandler')
      return
    }

    if (invitationLink) {
      await this.handleConnectToInvitation(invitationLink)
    } else {
      const actionJSON = {
        workflowID,
        actionID: actionId,
        data: {},
      }
      await this.agent.basicMessages.sendMessage(this.connectionId, JSON.stringify(actionJSON))
    }
  }

  /**
   * Handle connecting to an invitation from an action menu button
   * Ported from bifold-wallet-1 with full error handling and navigation support
   */
  private async handleConnectToInvitation(invitationLink: string): Promise<void> {
    const errorTitle = (this.t?.('Global.Error' as any) as string) ?? 'Error'

    if (!this.agent) {
      this.logger?.error('Agent is not initialized')
      Alert.alert(
        errorTitle,
        (this.t?.('Global.UnableToConnect' as any) as string) ?? 'Unable to connect. Please try again later.'
      )
      return
    }

    if (!this.logger) {
      console.warn('Logger not set for ActionMenuHandler, using console')
    }

    try {
      // Parse the invitation first
      const parsedInvitation = await this.agent.oob.parseInvitation(invitationLink)
      const invitationId = parsedInvitation.id

      // Check if we already have an existing connection via this invitation
      const existingOutOfBandRecord = await this.agent.oob.findByReceivedInvitationId(invitationId)
      if (existingOutOfBandRecord) {
        const existingConnections = await this.agent.connections.findAllByOutOfBandId(existingOutOfBandRecord.id)

        if (existingConnections && existingConnections.length > 0) {
          const existingConnection = existingConnections[0]
          this.logger?.info('Already connected via this invitation, navigating to existing chat')

          // Navigate to the existing connection's chat
          if (this.navigation) {
            this.navigation.reset({
              index: 0,
              routes: [
                {
                  name: Screens.Chat as any,
                  params: { connectionId: existingConnection.id },
                },
              ],
            })
          }
          return
        }
      }

      // Use the connectFromScanOrDeepLink helper which handles all the connection logic
      // and navigates to the Connection screen to show progress
      if (this.navigation && this.logger) {
        await connectFromScanOrDeepLink(
          invitationLink,
          this.agent,
          this.logger,
          this.navigation,
          false, // isDeepLink
          false, // implicitInvitations
          true // reuseConnection
        )
      } else {
        // Fallback: receive invitation directly without navigation
        const receivedInvitation = await this.agent.oob.receiveInvitation(parsedInvitation)
        this.logger?.info(`Invitation received, oob record id: ${receivedInvitation.outOfBandRecord.id}`)
      }
    } catch (error) {
      this.logger?.error('Error processing the invitation:', error as Error)
      Alert.alert(
        errorTitle,
        (this.t?.('Global.ConnectionError' as any) as string) ?? 'An error occurred while connecting. Please try again.'
      )
    }
  }

  /**
   * Parse an action menu from a BasicMessageRecord
   */
  private parseActionMenu(record: BasicMessageRecord): ActionMenuMessage | undefined {
    try {
      const parsed = JSON.parse(record.content)
      if (parsed && Array.isArray(parsed.displayData)) {
        return {
          displayData: parsed.displayData as ActionMenuContentItem[],
          workflowID: parsed.workflowID ?? '',
        }
      }
    } catch {
      // Not an action menu message
    }
    return undefined
  }
}

/**
 * Factory function to create an ActionMenuWorkflowHandler
 */
export function createActionMenuHandler(): ActionMenuWorkflowHandler {
  return new ActionMenuWorkflowHandler()
}
