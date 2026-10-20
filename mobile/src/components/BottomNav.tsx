import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

const TABS = [
  { id: 'Inicio', label: 'Inicio', icon: 'home' },
  { id: 'Explorar', label: 'Explorar', icon: 'compass' },
  { id: 'Guías', label: 'Guías', icon: 'book' },
  { id: 'IA', label: 'IA', icon: 'sparkles' },
  { id: 'Favoritos', label: 'Favoritos', icon: 'heart' },
  { id: 'Perfil', label: 'Perfil', icon: 'person' },
] as const

type BottomNavProps = {
  active: string
  onChange: (tab: string) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <View style={styles.nav}>
      {TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <Pressable
            key={tab.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onChange(tab.id)}
          >
            <Ionicons
              name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
              size={20}
              color={isActive ? COLORS.BLUE : COLORS.TEXT_MUTED}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
