/**
 * ChatHeaderRenderer
 *
 * Custom chat header with logo, title, and action buttons (bell, info).
 * Ported from bifold-wallet-dc.
 */

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { SvgProps } from 'react-native-svg'

import { useTheme } from '../../../contexts/theme'
import { ChatHeaderIconButton, ChatHeaderProps, IChatHeaderRenderer } from '../types'

interface HeaderProps extends ChatHeaderProps {
  /** Logo component to display */
  LogoComponent?: React.FC<SvgProps>
  /** Bell icon component */
  BellIconComponent?: React.FC<SvgProps>
  /** Info icon component */
  InfoIconComponent?: React.FC<SvgProps>
  /** Background color */
  backgroundColor?: string
  /** Title color */
  titleColor?: string
}

/**
 * Custom chat header component with logo and action buttons
 */
export const ChatHeader: React.FC<HeaderProps> = ({
  title,
  rightIcons = [],
  LogoComponent,
  BellIconComponent,
  InfoIconComponent,
  onShowMenu,
  onBack,
  onInfo,
  showMenuButton,
  showInfoButton,
  onMenuPress,
  backgroundColor,
  titleColor,
}) => {
  const { SettingsTheme } = useTheme()
  const bgColor = backgroundColor || SettingsTheme.newSettingColors.bgColorDown
  const textColor = titleColor || SettingsTheme.newSettingColors.headerTitle

  // Build right icons array
  const icons: ChatHeaderIconButton[] = [...rightIcons]

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
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Left section - Back button or Logo */}
      <View style={styles.leftSection}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} accessibilityLabel="Go back" accessibilityRole="button">
            {LogoComponent ? <LogoComponent width={40} height={40} /> : <Text style={styles.backText}>{'<'}</Text>}
          </TouchableOpacity>
        ) : (
          LogoComponent && <LogoComponent width={40} height={40} />
        )}
      </View>

      {/* Center section - Title */}
      <View style={styles.centerSection}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
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
            <icon.IconComponent width={24} height={24} />
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
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
  backText: {
    fontSize: 24,
    fontWeight: '600',
  },
})

interface ChatHeaderRendererOptions {
  /** Logo component */
  LogoComponent?: React.FC<SvgProps>
  /** Bell icon component */
  BellIconComponent?: React.FC<SvgProps>
  /** Info icon component */
  InfoIconComponent?: React.FC<SvgProps>
  /** Background color */
  backgroundColor?: string
  /** Title color */
  titleColor?: string
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
        backgroundColor={this.options.backgroundColor}
        titleColor={this.options.titleColor}
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
