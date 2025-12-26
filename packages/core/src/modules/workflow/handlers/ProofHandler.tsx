/**
 * ProofWorkflowHandler
 *
 * Handles proof exchange workflow records in the chat interface.
 * Supports custom renderers for displaying proofs as visual cards.
 */

import { ConnectionRecord, ProofExchangeRecord, ProofState } from '@credo-ts/core'
import { isPresentationReceived } from '@bifold/verifier'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { TFunction } from 'react-i18next'

import { ChatEvent } from '../../../components/chat/ChatEvent'
import { CallbackType, ExtendedChatMessage } from '../../../components/chat/ChatMessage'
import { SettingsTheme } from '../../../theme'
import { Role } from '../../../types/chat'
import { Screens, Stacks } from '../../../types/navigators'
import { getProofEventLabel, getProofEventRole } from '../../../utils/helpers'
import { IProofRenderer, MessageContext, NavigationResult, RenderContext, WorkflowType } from '../types'

import { BaseWorkflowHandler } from './BaseWorkflowHandler'

export class ProofWorkflowHandler extends BaseWorkflowHandler<ProofExchangeRecord> {
  readonly type = WorkflowType.Proof
  readonly displayName = 'Proof Exchange'

  /** Custom renderer for displaying proofs as visual cards */
  private renderer?: IProofRenderer

  canHandle(record: unknown): record is ProofExchangeRecord {
    return record instanceof ProofExchangeRecord
  }

  getRole(record: ProofExchangeRecord): Role {
    return getProofEventRole(record)
  }

  getLabel(record: ProofExchangeRecord, t: TFunction): string {
    const labelKey = getProofEventLabel(record)
    return labelKey ? t(labelKey as any) : ''
  }

  getCallbackType(record: ProofExchangeRecord): CallbackType | undefined {
    // Receiving a proof request or verifier receiving presentation
    if (
      (isPresentationReceived(record) && record.isVerified !== undefined) ||
      record.state === ProofState.RequestReceived ||
      (record.state === ProofState.Done && record.isVerified === undefined)
    ) {
      return CallbackType.ProofRequest
    }

    // After sending a presentation
    if (record.state === ProofState.PresentationSent || record.state === ProofState.Done) {
      return CallbackType.PresentationSent
    }

    return undefined
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOM RENDERER SUPPORT
  // ═══════════════════════════════════════════════════════════════════════════

  setRenderer(renderer: IProofRenderer): void {
    this.renderer = renderer
  }

  getRenderer(): IProofRenderer | undefined {
    return this.renderer
  }

  hasCustomRenderer(): boolean {
    return this.renderer !== undefined
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE TRANSFORMATION
  // ═══════════════════════════════════════════════════════════════════════════

  toMessage(record: ProofExchangeRecord, connection: ConnectionRecord, context: MessageContext): ExtendedChatMessage {
    const role = this.getRole(record)
    const userLabel = role === Role.me ? context.t('Chat.UserYou') : context.theirLabel
    const actionLabel = this.getLabel(record, context.t)

    let renderEvent: () => React.ReactElement

    // Use custom renderer if available (and not PresentationSent state which should be hidden)
    if (this.renderer && context.navigation && record.state !== ProofState.PresentationSent) {
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

  getDetailNavigation(record: ProofExchangeRecord): NavigationResult | undefined {
    const toProofDetails = (): NavigationResult => ({
      stack: Stacks.ContactStack,
      screen: Screens.ProofDetails,
      params: {
        recordId: record.id,
        isHistory: true,
        senderReview:
          record.state === ProofState.PresentationSent ||
          (record.state === ProofState.Done && record.isVerified === undefined),
      },
    })

    switch (record.state) {
      case ProofState.Done:
      case ProofState.PresentationSent:
      case ProofState.PresentationReceived:
        return toProofDetails()

      case ProofState.RequestReceived:
        return {
          stack: Stacks.ConnectionStack,
          screen: Screens.Connection,
          params: { proofId: record.id },
        }

      default:
        return undefined
    }
  }

  /**
   * Create the onDetails callback for navigation
   */
  private createOnDetails(
    record: ProofExchangeRecord,
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

  isNotification(record: ProofExchangeRecord): boolean {
    return record.state === ProofState.RequestReceived
  }
}

/**
 * Factory function to create a ProofWorkflowHandler
 */
export function createProofHandler(): ProofWorkflowHandler {
  return new ProofWorkflowHandler()
}
