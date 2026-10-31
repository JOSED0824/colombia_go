import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

const TABS = [
  { id: 'Inicio', label: 'nav.home', icon: 'home' },
  { id: 'Explorar', label: 'nav.explore', icon: 'compass' },
  { id: 'Guías', label: 'nav.guides', icon: 'book' },
  { id: 'IA', label: 'nav.ai', icon: 'sparkles' },
  { id: 'Favoritos', label: 'nav.favorites', icon: 'heart' },
  { id: 'Perfil', label: 'nav.profile', icon: 'person' },
] as const

type BottomNavProps = {
  active: string
  onChange: (tab: string) => void
  /** Informa dónde quedó cada pestaña (lo usa el recorrido guiado para señalarla). */
  onTabLayout?: (tab: string, layout: { x: number; width: number }) => void
}

export function BottomNav({ active, onChange, onTabLayout }: BottomNavProps) {
  const { t } = useTranslation()
  return (
    <View style={styles.nav}>
      {TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <Pressable
            key={tab.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onChange(tab.id)}
            onLayout={(e) => onTabLayout?.(tab.id, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
          >
            <Ionicons
              name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
              size={20}
              color={isActive ? COLORS.BLUE : COLORS.TEXT_MUTED}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{t(tab.label)}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
