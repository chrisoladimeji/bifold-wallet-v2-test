/**
 * ChatHeaderRenderer
 *
 * Custom chat header with logo, title, and action buttons (bell, info).
 * Ported from bifold-wallet-dc.
 */

import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { SvgProps } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '../../../components/texts/ThemedText'
import { useTheme } from '../../../contexts/theme'
import { ChatHeaderIconButton, ChatHeaderProps, IChatHeaderRenderer } from '../types'

interface HeaderProps extends ChatHeaderProps {
  /** Logo component to display */
  LogoComponent?: React.FC<SvgProps>
  /** Bell icon component */
  BellIconComponent?: React.FC<SvgProps>
  /** Info icon component */
  InfoIconComponent?: React.FC<SvgProps>
  /** Video icon component */
  VideoIconComponent?: React.FC<SvgProps>
  /** Background color */
  backgroundColor?: string
  /** Title color */
  titleColor?: string
  /** Icon color */
  iconColor?: string
}

/**
 * Custom chat header component with logo and action buttons
 */
export const ChatHeader: React.FC<HeaderProps> = ({
  title,
  rightIcons = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogoComponent,
  BellIconComponent,
  InfoIconComponent,
  VideoIconComponent,
  onShowMenu,
  onBack,
  onInfo,
  onVideoCall,
  showMenuButton,
  showInfoButton,
  showVideoButton,
  onMenuPress,
  backgroundColor,
  titleColor,
  iconColor,
}) => {
  const { ColorPalette } = useTheme()
  const insets = useSafeAreaInsets()
  const bgColor = backgroundColor || ColorPalette.brand.secondaryBackground
  const textColor = titleColor || ColorPalette.brand.text
  const iconsColor = iconColor || ColorPalette.brand.text

  // Build right icons array
  const icons: ChatHeaderIconButton[] = [...rightIcons]

  // Add video call icon if provided and showVideoButton is true
  if (VideoIconComponent && (showVideoButton || onVideoCall)) {
    icons.push({
      IconComponent: VideoIconComponent,
      onPress: onVideoCall || (() => {}),
      accessibilityLabel: 'Start video call',
    })
  }

  // Add bell icon if provided and showMenuButton is true
  if (BellIconComponent && (showMenuButton || onShowMenu)) {
    icons.push({
      IconComponent: BellIconComponent,
      onPress: onMenuPress || onShowMenu || (() => {}),
      accessibilityLabel: 'Show menu',
    })
  }

  // Add info icon if provided and showInfoButton is true
  if (InfoIconComponent && (showInfoButton || onInfo)) {
    icons.push({
      IconComponent: InfoIconComponent,
      onPress: onInfo || (() => {}),
      accessibilityLabel: 'Show info',
    })
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top + 12 }]}>
      {/* Left section - Back button */}
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={styles.backButton}
          >
            <ThemedText style={[styles.backArrow, { color: textColor }]}>{'‹'}</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Center section - Title */}
      <View style={styles.centerSection}>
        <ThemedText style={[styles.title, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </ThemedText>
      </View>

      {/* Right section - Action buttons */}
      <View style={styles.rightSection}>
        {icons.map((icon, index) => (
          <TouchableOpacity
            key={index}
            style={styles.iconButton}
            onPress={icon.onPress}
            accessibilityLabel={icon.accessibilityLabel}
            accessibilityRole="button"
          >
            <icon.IconComponent width={24} height={24} fill={iconsColor} color={iconsColor} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0,
  },
  leftSection: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 40,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minWidth: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backArrow: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
})

interface ChatHeaderRendererOptions {
  /** Logo component */
  LogoComponent?: React.FC<SvgProps>
  /** Bell icon component */
  BellIconComponent?: React.FC<SvgProps>
  /** Info icon component */
  InfoIconComponent?: React.FC<SvgProps>
  /** Video icon component */
  VideoIconComponent?: React.FC<SvgProps>
  /** Background color */
  backgroundColor?: string
  /** Title color */
  titleColor?: string
  /** Icon color */
  iconColor?: string
}

/**
 * Chat header renderer class implementing IChatHeaderRenderer
 */
export class ChatHeaderRenderer implements IChatHeaderRenderer {
  private options: ChatHeaderRendererOptions

  constructor(options: ChatHeaderRendererOptions = {}) {
    this.options = options
  }

  render(props: ChatHeaderProps): React.ReactElement {
    return (
      <ChatHeader
        {...props}
        LogoComponent={this.options.LogoComponent}
        BellIconComponent={this.options.BellIconComponent}
        InfoIconComponent={this.options.InfoIconComponent}
        VideoIconComponent={this.options.VideoIconComponent}
        backgroundColor={this.options.backgroundColor}
        titleColor={this.options.titleColor}
        iconColor={this.options.iconColor}
      />
    )
  }
}

/**
 * Factory function to create a ChatHeaderRenderer
 */
export function createChatHeaderRenderer(options: ChatHeaderRendererOptions = {}): ChatHeaderRenderer {
  return new ChatHeaderRenderer(options)
}

export default ChatHeader
