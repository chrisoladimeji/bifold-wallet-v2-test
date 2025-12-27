/**
 * BaseWorkflowHandler
 *
 * Abstract base class that provides common functionality for workflow handlers.
 * Extend this class to create new workflow handlers.
 */

import { ConnectionRecord } from '@credo-ts/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { TFunction } from 'react-i18next'

import { CallbackType, ExtendedChatMessage } from '../../../components/chat/ChatMessage'
import { Role } from '../../../types/chat'
import {
  ActionContext,
  IWorkflowHandler,
  MessageContext,
  NavigationResult,
  NotificationItem,
  WorkflowAction,
  WorkflowType,
} from '../types'

/**
 * Abstract base class for workflow handlers
 *
 * Provides default implementations for optional methods and
 * helper methods for common operations.
 */
export abstract class BaseWorkflowHandler<T = unknown> implements IWorkflowHandler<T> {
  abstract readonly type: WorkflowType
  abstract readonly displayName: string

  // ═══════════════════════════════════════════════════════════════════════════
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ═══════════════════════════════════════════════════════════════════════════

  abstract canHandle(record: unknown): record is T
  abstract toMessage(record: T, connection: ConnectionRecord, context: MessageContext): ExtendedChatMessage
  abstract getCallbackType(record: T): CallbackType | undefined
  abstract getRole(record: T): Role
  abstract getLabel(record: T, t: TFunction): string
  abstract getDetailNavigation(record: T, navigation: StackNavigationProp<any>): NavigationResult | undefined

  // ═══════════════════════════════════════════════════════════════════════════
  // DEFAULT IMPLEMENTATIONS - Can be overridden by subclasses
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Default: no actions available
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getActions(record: T, context: ActionContext): WorkflowAction[] {
    return []
  }

  /**
   * Default: no action handling
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleAction(record: T, actionId: string, data?: Record<string, unknown>): Promise<void> {
    // Default: do nothing
  }

  /**
   * Default: not a notification
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isNotification(record: T): boolean {
    return false
  }

  /**
   * Default: no notification conversion
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toNotification(record: T): NotificationItem {
    throw new Error('toNotification not implemented')
  }

  /**
   * Default: always display
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldDisplay(record: T): boolean {
    return true
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Helper to get the record ID
   */
  protected getRecordId(record: T): string {
    return (record as any).id ?? ''
  }

  /**
   * Helper to get the record creation date
   */
  protected getCreatedAt(record: T): Date {
    return (record as any).createdAt ?? new Date()
  }

  /**
   * Helper to get the record type string
   */
  protected getRecordType(record: T): string {
    return (record as any).type ?? this.type
  }

  /**
   * Helper to create a basic chat message structure
   */
  protected createBaseMessage(
    record: T,
    context: MessageContext,
    renderEvent: () => React.JSX.Element
  ): Omit<ExtendedChatMessage, 'messageOpensCallbackType' | 'onDetails'> {
    const role = this.getRole(record)

    return {
      _id: this.getRecordId(record),
      text: this.getLabel(record, context.t),
      renderEvent,
      createdAt: this.getCreatedAt(record),
      user: { _id: role },
    }
  }
}
