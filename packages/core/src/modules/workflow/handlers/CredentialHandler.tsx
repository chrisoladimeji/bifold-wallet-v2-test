/**
 * CredentialWorkflowHandler
 *
 * Handles credential exchange workflow records in the chat interface.
 * Supports custom renderers for displaying credentials as visual cards.
 */

import { ConnectionRecord, CredentialExchangeRecord, CredentialState } from '@credo-ts/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { TFunction } from 'react-i18next'

import { ChatEvent } from '../../../components/chat/ChatEvent'
import { CallbackType, ExtendedChatMessage } from '../../../components/chat/ChatMessage'
import { SettingsTheme } from '../../../theme'
import { Role } from '../../../types/chat'
import { Screens, Stacks } from '../../../types/navigators'
import { getCredentialEventLabel, getCredentialEventRole } from '../../../utils/helpers'
import { ICredentialRenderer, MessageContext, NavigationResult, RenderContext, WorkflowType } from '../types'

import { BaseWorkflowHandler } from './BaseWorkflowHandler'

export class CredentialWorkflowHandler extends BaseWorkflowHandler<CredentialExchangeRecord> {
  readonly type = WorkflowType.Credential
  readonly displayName = 'Credential Exchange'

  /** Custom renderer for displaying credentials as visual cards */
  private renderer?: ICredentialRenderer

  canHandle(record: unknown): record is CredentialExchangeRecord {
    return record instanceof CredentialExchangeRecord
  }

  getRole(record: CredentialExchangeRecord): Role {
    return getCredentialEventRole(record)
  }

  getLabel(record: CredentialExchangeRecord, t: TFunction): string {
    const labelKey = getCredentialEventLabel(record)
    return labelKey ? t(labelKey as any) : ''
  }

  getCallbackType(record: CredentialExchangeRecord): CallbackType | undefined {
    if (record.state === CredentialState.Done || record.state === CredentialState.OfferReceived) {
      return CallbackType.CredentialOffer
    }
    return undefined
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOM RENDERER SUPPORT
  // ═══════════════════════════════════════════════════════════════════════════

  setRenderer(renderer: ICredentialRenderer): void {
    this.renderer = renderer
  }

  getRenderer(): ICredentialRenderer | undefined {
    return this.renderer
  }

  hasCustomRenderer(): boolean {
    return this.renderer !== undefined
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE TRANSFORMATION
  // ═══════════════════════════════════════════════════════════════════════════

  toMessage(
    record: CredentialExchangeRecord,
    connection: ConnectionRecord,
    context: MessageContext
  ): ExtendedChatMessage {
    const role = this.getRole(record)
    const userLabel = role === Role.me ? context.t('Chat.UserYou') : context.theirLabel
    const actionLabel = this.getLabel(record, context.t)

    let renderEvent: () => React.ReactElement

    // Use custom renderer if available
    if (this.renderer && context.navigation) {
      const renderContext: RenderContext = {
        t: context.t,
        navigation: context.navigation,
        theirLabel: context.theirLabel,
        settingsTheme: SettingsTheme,
        chatTheme: context.theme,
        colorPalette: context.colorPalette,
        isInChat: true,
        modalWidthPercent: 90,
      }
      renderEvent = () => this.renderer!.render(record, renderContext)
    } else {
      // Default rendering as text event
      renderEvent = () => <ChatEvent role={role} userLabel={userLabel} actionLabel={actionLabel} />
    }

    return {
      ...this.createBaseMessage(record, context, renderEvent),
      messageOpensCallbackType: this.getCallbackType(record),
      onDetails: this.createOnDetails(record, context.navigation),
    }
  }

  getDetailNavigation(record: CredentialExchangeRecord): NavigationResult | undefined {
    if (record.state === CredentialState.Done) {
      return {
        stack: Stacks.ContactStack,
        screen: Screens.CredentialDetails,
        params: { credentialId: record.id },
      }
    }

    if (record.state === CredentialState.OfferReceived) {
      return {
        stack: Stacks.ConnectionStack,
        screen: Screens.Connection,
        params: { credentialId: record.id },
      }
    }

    return undefined
  }

  /**
   * Create the onDetails callback for navigation
   */
  private createOnDetails(
    record: CredentialExchangeRecord,
    navigation?: StackNavigationProp<any>
  ): (() => void) | undefined {
    if (!navigation) return undefined

    const navResult = this.getDetailNavigation(record)
    if (!navResult) return undefined

    return () => {
      if (navResult.stack) {
        // Navigate to a specific stack and screen
        const parent = navigation.getParent()
        if (parent) {
          parent.navigate(navResult.stack, {
            screen: navResult.screen,
            params: navResult.params,
          })
        } else {
          navigation.navigate(navResult.stack as any, {
            screen: navResult.screen,
            params: navResult.params,
          })
        }
      } else {
        navigation.navigate(navResult.screen as any, navResult.params)
      }
    }
  }

  isNotification(record: CredentialExchangeRecord): boolean {
    return record.state === CredentialState.OfferReceived
  }
}

/**
 * Factory function to create a CredentialWorkflowHandler
 */
export function createCredentialHandler(): CredentialWorkflowHandler {
  return new CredentialWorkflowHandler()
}
