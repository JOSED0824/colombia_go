import React from 'react'
import { Pressable, View } from 'react-native'
import { Text } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import type { NavTab } from '../lib/roleNav'

type BottomNavProps = {
  /** Pestañas según el tipo de cuenta (ver lib/roleNav.ts). */
  tabs: NavTab[]
  active: string
  onChange: (tab: string) => void
  /** Informa dónde quedó cada pestaña (lo usa el recorrido guiado para señalarla). */
  onTabLayout?: (tab: string, layout: { x: number; width: number }) => void
}

export function BottomNav({ tabs, active, onChange, onTabLayout }: BottomNavProps) {
  const { t } = useTranslation()
  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <Pressable
            key={tab.id}
            style={styles.navTab}
            onPress={() => onChange(tab.id)}
            onLayout={(e) => onTabLayout?.(tab.id, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
          >
            <View style={[styles.navItem, isActive && styles.navItemActive]}>
              <Ionicons
                name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
                size={20}
                color={isActive ? COLORS.INK : COLORS.TEXT_MUTED}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{t(tab.label)}</Text>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
