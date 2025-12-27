/**
 * WorkflowRegistry Implementation
 *
 * Central registry that manages workflow handlers and routes records
 * to the appropriate handler for processing.
 */

import { ConnectionRecord } from '@credo-ts/core'

import { ExtendedChatMessage } from '../../components/chat/ChatMessage'

import {
  ActionContext,
  IChatScreenConfig,
  ICredentialRenderer,
  IProofRenderer,
  IWorkflowHandler,
  IWorkflowRegistry,
  MessageContext,
  NotificationItem,
  WorkflowAction,
  WorkflowType,
} from './types'

type ChatActionFactory = (context: ActionContext) => WorkflowAction | undefined

export class WorkflowRegistry implements IWorkflowRegistry {
  private handlers: Map<WorkflowType, IWorkflowHandler> = new Map()
  private chatActions: Map<string, WorkflowAction | ChatActionFactory> = new Map()
  private chatScreenConfig: IChatScreenConfig | undefined

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION
  // ═══════════════════════════════════════════════════════════════════════════

  register(handler: IWorkflowHandler): void {
    this.handlers.set(handler.type, handler)
  }

  unregister(type: WorkflowType): void {
    this.handlers.delete(type)
  }

  getHandlers(): IWorkflowHandler[] {
    return Array.from(this.handlers.values())
  }

  getHandlerByType(type: WorkflowType): IWorkflowHandler | undefined {
    return this.handlers.get(type)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESOLUTION
  // ═══════════════════════════════════════════════════════════════════════════

  getHandler(record: unknown): IWorkflowHandler | undefined {
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(record)) {
        return handler
      }
    }
    return undefined
  }

  canHandle(record: unknown): boolean {
    return this.getHandler(record) !== undefined
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  toMessages(records: unknown[], connection: ConnectionRecord, context: MessageContext): ExtendedChatMessage[] {
    const messages: ExtendedChatMessage[] = []

    for (const record of records) {
      const handler = this.getHandler(record)
      if (handler) {
        // Check if the record should be displayed
        if (handler.shouldDisplay && !handler.shouldDisplay(record)) {
          continue
        }

        try {
          const message = handler.toMessage(record, connection, context)
          messages.push(message)
        } catch {
          // Failed to convert record to message - skip
        }
      }
    }
    return messages
  }

  getNotifications(records: unknown[]): NotificationItem[] {
    const notifications: NotificationItem[] = []

    for (const record of records) {
      const handler = this.getHandler(record)
      if (handler && handler.isNotification && handler.toNotification) {
        if (handler.isNotification(record)) {
          try {
            const notification = handler.toNotification(record)
            notifications.push(notification)
          } catch { /* notification conversion error */ }
        }
      }
    }

    return notifications
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  getChatActions(context: ActionContext): WorkflowAction[] {
    const actions: WorkflowAction[] = []

    for (const actionOrFactory of this.chatActions.values()) {
      if (typeof actionOrFactory === 'function') {
        const action = actionOrFactory(context)
        if (action) {
          actions.push(action)
        }
      } else {
        actions.push(actionOrFactory)
      }
    }

    return actions
  }

  registerChatAction(action: WorkflowAction | ChatActionFactory): void {
    if (typeof action === 'function') {
      // Generate a unique ID for factory functions
      const id = `factory_${this.chatActions.size}`
      this.chatActions.set(id, action)
    } else {
      this.chatActions.set(action.id, action)
    }
  }

  unregisterChatAction(actionId: string): void {
    this.chatActions.delete(actionId)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT SCREEN CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  setChatScreenConfig(config: IChatScreenConfig): void {
    this.chatScreenConfig = config

    // Apply renderers to handlers if provided
    if (config.credentialRenderer) {
      this.setCredentialRenderer(config.credentialRenderer)
    }
    if (config.proofRenderer) {
      this.setProofRenderer(config.proofRenderer)
    }
  }

  getChatScreenConfig(): IChatScreenConfig | undefined {
    return this.chatScreenConfig
  }

  setCredentialRenderer(renderer: ICredentialRenderer): void {
    const handler = this.handlers.get(WorkflowType.Credential)
    if (handler && handler.setRenderer) {
      handler.setRenderer(renderer)
    }
    // Also store in config
    if (!this.chatScreenConfig) {
      this.chatScreenConfig = {}
    }
    this.chatScreenConfig.credentialRenderer = renderer
  }

  setProofRenderer(renderer: IProofRenderer): void {
    const handler = this.handlers.get(WorkflowType.Proof)
    if (handler && handler.setRenderer) {
      handler.setRenderer(renderer)
    }
    // Also store in config
    if (!this.chatScreenConfig) {
      this.chatScreenConfig = {}
    }
    this.chatScreenConfig.proofRenderer = renderer
  }
}

/**
 * Create a new WorkflowRegistry instance with default configuration
 */
export function createWorkflowRegistry(): IWorkflowRegistry {
  return new WorkflowRegistry()
}
