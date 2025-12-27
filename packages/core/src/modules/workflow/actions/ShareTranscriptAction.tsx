/**
 * ShareTranscriptAction
 *
 * Chat action for sharing the conversation transcript.
 */

import React from 'react'
import { Share } from 'react-native'

import { ActionContext, WorkflowAction } from '../types'

export interface TranscriptMessage {
  sender: 'me' | 'them'
  content: string
  timestamp: Date
}

/**
 * Format messages into a shareable transcript string
 */
function formatTranscript(messages: TranscriptMessage[], contactName: string): string {
  const header = `Chat Transcript with ${contactName}\n${'='.repeat(40)}\n\n`

  const formattedMessages = messages
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((msg) => {
      const sender = msg.sender === 'me' ? 'You' : contactName
      const time = msg.timestamp.toLocaleString()
      return `[${time}] ${sender}:\n${msg.content}\n`
    })
    .join('\n')

  return header + formattedMessages
}

/**
 * Create the Share Transcript action
 */
export function createShareTranscriptAction(
  context: ActionContext,
  messages: TranscriptMessage[],
  contactName: string,
  IconComponent: React.FC<{ height: number; width: number }>
): WorkflowAction {
  return {
    id: 'share-transcript',
    text: (context.t('Chat.ShareTranscript' as any) as string) ?? 'Share Transcript',
    icon: () => <IconComponent height={30} width={30} />,
    onPress: async () => {
      const transcript = formatTranscript(messages, contactName)

      try {
        await Share.share({
          message: transcript,
          title: `Chat with ${contactName}`,
        })
      } catch { /* share error ignored */ }
    },
  }
}

/**
 * Factory function that returns an action factory for use with the registry
 */
export function shareTranscriptActionFactory(
  getMessages: () => TranscriptMessage[],
  contactName: string,
  IconComponent: React.FC<{ height: number; width: number }>
): (context: ActionContext) => WorkflowAction {
  return (context: ActionContext) => createShareTranscriptAction(context, getMessages(), contactName, IconComponent)
}
