/**
 * DigiCredChatBackgroundRenderer
 *
 * Custom chat background renderer using DigiCred gradient colors
 */

import React from 'react'
import { ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { DigiCredColors } from '../theme'

interface IChatBackgroundRenderer {
  render(children: React.ReactNode): React.ReactElement
}

interface DigiCredGradientBackgroundProps {
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * Gradient background component for chat screen
 */
const DigiCredChatGradientBackground: React.FC<DigiCredGradientBackgroundProps> = ({ children, style }) => {
  return (
    <LinearGradient
      colors={DigiCredColors.gradient.colors}
      locations={DigiCredColors.gradient.locations}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  )
}

/**
 * Chat background renderer class implementing IChatBackgroundRenderer
 */
export class DigiCredChatBackgroundRenderer implements IChatBackgroundRenderer {
  private style?: ViewStyle

  constructor(style?: ViewStyle) {
    this.style = style
  }

  render(children: React.ReactNode): React.ReactElement {
    return <DigiCredChatGradientBackground style={this.style}>{children}</DigiCredChatGradientBackground>
  }
}

export default DigiCredChatBackgroundRenderer
