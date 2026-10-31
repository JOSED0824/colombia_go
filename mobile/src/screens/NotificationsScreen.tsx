import React from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { useNotifications } from '../lib/notifications'

/** Centro de notificaciones: insignias ganadas y consejos. Tocar un aviso lo marca como leído y abre la sección relacionada. */
export function NotificationsScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (target: string) => void }) {
  const { t } = useTranslation()
  const { items, unread, isSeen, markSeen, markAllSeen } = useNotifications()

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle}>{t('notifications.title')}</Text>
      </View>

      {unread > 0 && (
        <Pressable style={styles.notifMarkAll} onPress={markAllSeen}>
          <Ionicons name="checkmark-done" size={16} color={COLORS.BLUE} />
          <Text style={styles.notifMarkAllText}>{t('notifications.markAll')}</Text>
        </Pressable>
      )}

      {items.length === 0 ? (
        <Text style={{ textAlign: 'center', color: COLORS.TEXT_MUTED, marginTop: 60 }}>{t('notifications.empty')}</Text>
      ) : (
        items.map((n) => {
          const read = isSeen(n.id)
          return (
            <Pressable
              key={n.id}
              style={[styles.notifCard, !read && styles.notifCardUnread]}
              onPress={() => {
                markSeen(n.id)
                if (n.target) onNavigate(n.target)
              }}
            >
              <View style={[styles.notifIcon, { backgroundColor: n.color + '22' }]}>
                <Ionicons name={n.icon as any} size={22} color={n.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifText}>{n.text}</Text>
              </View>
              {!read && <View style={styles.notifUnreadDot} />}
            </Pressable>
          )
        })
      )}
    </View>
  )
}
