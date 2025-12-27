/**
 * Themed Tab Bar Component
 *
 * A customizable tab bar that renders based on theme configuration.
 * Supports different variants: default, floating, minimal, attached.
 */

import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ITabBarConfig } from '../types'
import { useTabBarTheme } from '../hooks/useTabBarTheme'

export interface ThemedTabBarProps extends BottomTabBarProps {
  /** Tab bar configuration (optional, uses registry if not provided) */
  config?: ITabBarConfig
}

/**
 * Badge Component
 */
const Badge: React.FC<{
  count: number
  config: ITabBarConfig['badge']
}> = ({ count, config }) => {
  if (count <= 0) return null

  const badgeStyle: ViewStyle = {
    position: 'absolute',
    top: config.position.top,
    right: config.position.right,
    minWidth: config.minWidth,
    height: config.size,
    borderRadius: config.borderRadius,
    backgroundColor: config.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  }

  const textStyle: TextStyle = {
    color: config.textColor,
    fontSize: config.fontSize,
    fontWeight: config.fontWeight,
  }

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{count > 99 ? '99+' : count}</Text>
    </View>
  )
}

/**
 * Tab Item Component
 */
const TabItem: React.FC<{
  route: BottomTabBarProps['state']['routes'][0]
  index: number
  state: BottomTabBarProps['state']
  navigation: BottomTabBarProps['navigation']
  descriptors: BottomTabBarProps['descriptors']
  config: ITabBarConfig
  badgeCount?: number
}> = ({ route, index, state, navigation, descriptors, config, badgeCount }) => {
  const { options } = descriptors[route.key]
  const isFocused = state.index === index

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    })

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name)
    }
  }

  const onLongPress = () => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    })
  }

  const color = isFocused
    ? config.colors.activeTintColor
    : config.colors.inactiveTintColor

  // Get label
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name

  // Render icon if available
  const renderIcon = () => {
    if (options.tabBarIcon) {
      return options.tabBarIcon({
        focused: isFocused,
        color,
        size: config.tabItem.icon.size,
      })
    }
    return null
  }

  const containerStyle: ViewStyle = {
    flex: config.tabItem.container.flex,
    justifyContent: config.tabItem.container.justifyContent,
    alignItems: config.tabItem.container.alignItems,
    paddingVertical: config.tabItem.container.paddingVertical,
    paddingHorizontal: config.tabItem.container.paddingHorizontal,
  }

  const textStyle: TextStyle = {
    color,
    fontSize: config.tabItem.text.fontSize,
    fontWeight: config.tabItem.text.fontWeight,
    marginTop: config.tabItem.text.marginTop,
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={containerStyle}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
        {badgeCount !== undefined && badgeCount > 0 && (
          <Badge count={badgeCount} config={config.badge} />
        )}
      </View>
      {typeof label === 'string' && <Text style={textStyle}>{label}</Text>}
    </TouchableOpacity>
  )
}

/**
 * Themed Tab Bar Component
 *
 * @example
 * ```tsx
 * <Tab.Navigator
 *   tabBar={(props) => <ThemedTabBar {...props} />}
 * >
 *   <Tab.Screen name="Home" component={HomeScreen} />
 *   <Tab.Screen name="Credentials" component={CredentialsScreen} />
 *   <Tab.Screen name="Settings" component={SettingsScreen} />
 * </Tab.Navigator>
 * ```
 */
export const ThemedTabBar: React.FC<ThemedTabBarProps> = ({
  state,
  descriptors,
  navigation,
  config: directConfig,
}) => {
  const insets = useSafeAreaInsets()
  const registryConfig = useTabBarTheme()

  // Use direct config if provided, otherwise use registry
  const config = directConfig || registryConfig

  const isFloating = config.variant === 'floating'
  const isAbsolute = config.style.position === 'absolute'

  // Build container style
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: config.style.backgroundColor,
    height: config.style.height,
    borderTopWidth: config.style.borderTopWidth,
    borderTopColor: config.style.borderTopColor,
    paddingBottom: isFloating ? 0 : (config.style.paddingBottom ?? insets.bottom),
    paddingTop: config.style.paddingTop,
    paddingHorizontal: config.style.paddingHorizontal,
    // Shadow
    shadowColor: config.style.shadowColor,
    shadowOffset: config.style.shadowOffset,
    shadowRadius: config.style.shadowRadius,
    shadowOpacity: config.style.shadowOpacity,
    elevation: config.style.elevation,
  }

  // Floating variant specific styles
  if (isFloating || isAbsolute) {
    containerStyle.position = 'absolute'
    containerStyle.bottom = config.style.bottom ?? insets.bottom + 10
    containerStyle.left = config.style.left ?? 16
    containerStyle.right = config.style.right ?? 16
    containerStyle.borderRadius = config.style.borderRadius
  }

  return (
    <View style={containerStyle}>
      {state.routes.map((route, index) => {
        // Find tab definition for badge info
        const tabDef = config.tabs.find(
          (t) => t.id === route.name.toLowerCase() || t.label === route.name
        )
        const showBadge = tabDef?.showBadge

        // TODO: Get actual badge count from state/context
        // This would need integration with notifications state
        const badgeCount = showBadge ? 0 : undefined

        return (
          <TabItem
            key={route.key}
            route={route}
            index={index}
            state={state}
            navigation={navigation}
            descriptors={descriptors}
            config={config}
            badgeCount={badgeCount}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
})

export default ThemedTabBar
