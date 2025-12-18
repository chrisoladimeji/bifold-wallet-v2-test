/**
 * SendProofRequestAction
 *
 * Chat action for sending proof requests to a connection.
 */

import React from 'react'

import { Screens, Stacks } from '../../../types/navigators'
import { ActionContext, WorkflowAction } from '../types'

/**
 * Create the Send Proof Request action
 *
 * This action is only available when verifier capability is enabled.
 */
export function createSendProofRequestAction(
  context: ActionContext,
  useVerifierCapability: boolean,
  IconComponent: React.FC<{ height: number; width: number }>
): WorkflowAction | undefined {
  if (!useVerifierCapability) {
    return undefined
  }

  return {
    id: 'send-proof-request',
    text: context.t('Verifier.SendProofRequest'),
    icon: () => <IconComponent height={30} width={30} />,
    onPress: () => {
      context.navigation.navigate(Stacks.ProofRequestsStack as any, {
        screen: Screens.ProofRequests,
        params: { connectionId: context.connectionId },
      })
    },
  }
}

/**
 * Factory function that returns an action factory for use with the registry
 */
export function sendProofRequestActionFactory(
  useVerifierCapability: boolean,
  IconComponent: React.FC<{ height: number; width: number }>
): (context: ActionContext) => WorkflowAction | undefined {
  return (context: ActionContext) => createSendProofRequestAction(context, useVerifierCapability, IconComponent)
}
