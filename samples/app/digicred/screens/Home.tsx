import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useConnections } from '@credo-ts/react-hooks'
import { ConnectionType, DidExchangeState } from '@credo-ts/core'

import {
  Screens,
  Stacks,
  testIdWithKey,
  useStore,
  getConnectionName,
  TOKENS,
  useServices,
} from '@bifold/core'

import { GradientBackground } from '../components'
import { DigiCredColors } from '../theme'

interface ContactCardProps {
  name: string
  date: string
  imageUrl?: string
  hasUnread?: boolean
  onPress: () => void
}

const ContactCard: React.FC<ContactCardProps> = ({
  name,
  date,
  imageUrl,
  hasUnread,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.contactCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.contactAvatar}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactName} numberOfLines={2}>{name}</Text>
        <Text style={styles.contactDate}>{date}</Text>
      </View>
      <View style={styles.rightSection}>
        {hasUnread && <View style={styles.unreadDot} />}
        <Icon name="chevron-right" size={24} color={DigiCredColors.text.secondary} />
      </View>
    </TouchableOpacity>
  )
}

const Home: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<Record<string, object | undefined>>>()
  const [store] = useStore()
  const [config] = useServices([TOKENS.CONFIG])
  const contactHideList = config?.contactHideList

  // Get connections from Credo
  const connectionsResult = useConnections()
  const { records: connections = [] } = connectionsResult ?? { records: [] }

  // Filter out mediator connections, hidden contacts, and incomplete connections
  const filteredConnections = useMemo(() => {
    if (!connections || !Array.isArray(connections)) return []
    return connections.filter((connection) => {
      // Filter out mediator connections
      if (connection.connectionTypes.includes(ConnectionType.Mediator)) {
        return false
      }
      // Filter out hidden contacts
      const contactName = connection.theirLabel || connection.alias
      if (contactHideList?.includes(contactName ?? '')) {
        return false
      }
      // Only show completed connections (unless developer mode is enabled)
      if (!store.preferences.developerModeEnabled && connection.state !== DidExchangeState.Completed) {
        return false
      }
      return true
    })
  }, [connections, contactHideList, store.preferences.developerModeEnabled])

  const handleScanPress = useCallback(() => {
    navigation.navigate(Stacks.ConnectStack as string, { screen: Screens.Scan } as Record<string, unknown>)
  }, [navigation])

  const handleContactPress = useCallback((connectionId: string) => {
    navigation.navigate(Screens.Chat, { connectionId })
  }, [navigation])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    }
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Sort filtered connections by most recent
  const sortedConnections = useMemo(() => {
    return [...filteredConnections].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()
      return dateB - dateA
    })
  }, [filteredConnections])

  const renderContact = ({ item }: { item: typeof sortedConnections[0] }) => {
    const contactName = getConnectionName(item, store.preferences.alternateContactNames) || 'Unknown Contact'

    return (
      <ContactCard
        name={contactName}
        date={formatDate(item.updatedAt || item.createdAt)}
        hasUnread={false}
        onPress={() => handleContactPress(item.id)}
      />
    )
  }

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Icon name="account-group-outline" size={48} color={DigiCredColors.button.primary} />
        </View>
        <Text style={styles.emptyTitle}>No Contacts Yet</Text>
        <Text style={styles.emptySubtitle}>
          Scan a QR code to connect with organizations and individuals.
        </Text>
        <TouchableOpacity
          style={styles.scanActionButton}
          onPress={handleScanPress}
          testID={testIdWithKey('ScanToConnect')}
        >
          <Icon name="qrcode-scan" size={20} color="#FFFFFF" />
          <Text style={styles.scanActionButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Screens.Home') || 'Home'}</Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanPress}
            testID={testIdWithKey('ScanButton')}
            accessibilityLabel={t('Home.Scan') || 'Scan QR Code'}
          >
            <Icon name="qrcode-scan" size={24} color={DigiCredColors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Contacts List */}
        <FlatList
          data={sortedConnections}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Account for status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: DigiCredColors.text.primary,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 50, 50, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: DigiCredColors.card.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
  },
  contactContent: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
  },
  contactDate: {
    fontSize: 12,
    color: DigiCredColors.text.secondary,
    marginTop: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14FFEC',
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30, 50, 50, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DigiCredColors.text.primary,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: DigiCredColors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  scanActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DigiCredColors.button.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  scanActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
})

export default Home
