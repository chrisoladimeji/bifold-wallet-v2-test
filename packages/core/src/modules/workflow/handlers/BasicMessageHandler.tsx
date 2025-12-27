/**
 * BasicMessageWorkflowHandler
 *
 * Handles basic text messages in the chat interface.
 * Also detects and delegates action menu messages.
 */

import { BasicMessageRecord, ConnectionRecord } from '@credo-ts/core'
import { BasicMessageRole } from '@credo-ts/core/build/modules/basic-messages/BasicMessageRole'
import React, { Fragment } from 'react'
import { Linking, View } from 'react-native'

import { CallbackType, ExtendedChatMessage } from '../../../components/chat/ChatMessage'
import { ThemedText } from '../../../components/texts/ThemedText'
import { Role } from '../../../types/chat'
import { ActionMenuMessage, MessageContext, NavigationResult, WorkflowType } from '../types'

import { BaseWorkflowHandler } from './BaseWorkflowHandler'

// Regex patterns for link detection
const LINK_REGEX = /(?:https?:\/\/\w+(?:\.\w+)+\S*)|(?:[\w\d._-]+@\w+(?:\.\w+)+)/gim
const MAIL_REGEX = /^[\w\d._-]+@\w+(?:\.\w+)+$/gim

export class BasicMessageWorkflowHandler extends BaseWorkflowHandler<BasicMessageRecord> {
  readonly type = WorkflowType.BasicMessage
  readonly displayName = 'Basic Message'

  canHandle(record: unknown): record is BasicMessageRecord {
    // Check if it's a BasicMessageRecord and NOT an action menu message
    if (!(record instanceof BasicMessageRecord)) {
      return false
    }

    // Don't handle action menu messages - let ActionMenuHandler handle those
    if (this.isActionMenuMessage(record)) {
      return false
    }

    return true
  }

  getRole(record: BasicMessageRecord): Role {
    return record.role === BasicMessageRole.Sender ? Role.me : Role.them
  }

  getLabel(record: BasicMessageRecord): string {
    return record.content
  }

  getCallbackType(): CallbackType | undefined {
    // Basic messages don't have callback actions
    return undefined
  }

  toMessage(record: BasicMessageRecord, _connection: ConnectionRecord, context: MessageContext): ExtendedChatMessage {
    const role = this.getRole(record)
    const links = record.content.match(LINK_REGEX) ?? []

    const handleLinkPress = (link: string) => {
      if (link.match(MAIL_REGEX)) {
        link = 'mailto:' + link
      }
      Linking.openURL(link)
    }

    const bubbleStyle = {
      backgroundColor: context.colorPalette.brand.secondaryBackground,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: context.colorPalette.brand.primary,
      maxWidth: 280,
    }

    const renderEvent = () => (
      <View style={bubbleStyle}>
        <ThemedText style={role === Role.me ? context.theme.rightText : context.theme.leftText}>
          {record.content.split(LINK_REGEX).map((split, i) => {
            if (i < links.length) {
              const link = links[i]
              return (
                <Fragment key={`${record.id}-${i}`}>
                  <ThemedText>{split}</ThemedText>
                  <ThemedText
                    onPress={() => handleLinkPress(link)}
                    style={{ color: context.colorPalette.brand.link, textDecorationLine: 'underline' }}
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
      </View>
    )

    return {
      _id: record.id,
      text: record.content,
      renderEvent,
      createdAt: record.createdAt,
      user: { _id: role },
      messageOpensCallbackType: undefined,
      onDetails: undefined,
    }
  }

  getDetailNavigation(): NavigationResult | undefined {
    // Basic messages don't navigate anywhere
    return undefined
  }

  shouldDisplay(record: BasicMessageRecord): boolean {
    const role = this.getRole(record)

    // Filter out certain messages
    // 1. Don't show ":menu" messages sent by user
    if (role === Role.me && record.content === ':menu') {
      return false
    }

    // 2. Don't show JSON messages sent by user (workflow actions)
    if (role === Role.me && this.isJsonMessage(record.content)) {
      return false
    }

    // 3. Don't show empty messages
    if (!record.content || record.content.trim() === '') {
      return false
    }

    // 4. Don't show "received your message" delivery confirmations
    if (record.content.includes(' received your message')) {
      return false
    }

    // 5. Don't show workflow control messages (e.g., {"workflowID":"root-menu"})
    if (this.isWorkflowControlMessage(record.content)) {
      return false
    }

    return true
  }

  /**
   * Check if a message is an action menu message (JSON with displayData)
   */
  private isActionMenuMessage(record: BasicMessageRecord): boolean {
    try {
      const parsed = JSON.parse(record.content)
      return parsed && Array.isArray(parsed.displayData)
    } catch {
      return false
    }
  }

  /**
   * Check if content is valid JSON
   */
  private isJsonMessage(content: string): boolean {
    try {
      JSON.parse(content)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if content is a workflow control message (JSON with only workflowID, no displayData)
   */
  private isWorkflowControlMessage(content: string): boolean {
    try {
      const parsed = JSON.parse(content)
      // It's a control message if it has workflowID but no displayData
      return parsed && parsed.workflowID && !Array.isArray(parsed.displayData)
    } catch {
      return false
    }
  }

  /**
   * Parse an action menu message from a BasicMessageRecord
   */
  static parseActionMenuMessage(record: BasicMessageRecord): ActionMenuMessage | undefined {
    try {
      const parsed = JSON.parse(record.content)
      if (parsed && Array.isArray(parsed.displayData)) {
        return {
          displayData: parsed.displayData,
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
 * Factory function to create a BasicMessageWorkflowHandler
 */
export function createBasicMessageHandler(): BasicMessageWorkflowHandler {
  return new BasicMessageWorkflowHandler()
}
