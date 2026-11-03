import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, View, StyleSheet } from 'react-native'
import { Text } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { tapFeedback } from '../lib/haptics'
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
  return (
    <View style={styles.nav}>
      {tabs.map((tab) => (
        <NavButton
          key={tab.id}
          tab={tab}
          active={active === tab.id}
          onPress={() => {
            if (active !== tab.id) tapFeedback()
            onChange(tab.id)
          }}
          onLayout={(layout) => onTabLayout?.(tab.id, layout)}
        />
      ))}
    </View>
  )
}

/**
 * Botón de la barra: la "píldora" amarilla aparece con un resorte al activarse (como en iOS), el ícono da un pequeño
 * salto y todo el botón se hunde un poco mientras se presiona.
 */
function NavButton({
  tab,
  active,
  onPress,
  onLayout,
}: {
  tab: NavTab
  active: boolean
  onPress: () => void
  onLayout: (layout: { x: number; width: number }) => void
}) {
  const { t } = useTranslation()
  const on = useRef(new Animated.Value(active ? 1 : 0)).current
  const press = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.spring(on, { toValue: active ? 1 : 0, speed: 16, bounciness: active ? 10 : 0, useNativeDriver: true }).start()
  }, [active, on])

  const pressTo = (v: number) => Animated.spring(press, { toValue: v, speed: 40, bounciness: 0, useNativeDriver: true }).start()

  return (
    <Pressable
      style={styles.navTab}
      onPress={onPress}
      onPressIn={() => pressTo(0.9)}
      onPressOut={() => pressTo(1)}
      onLayout={(e) => onLayout({ x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
    >
      <Animated.View style={[styles.navItem, { transform: [{ scale: press }] }]}>
        <Animated.View
          style={[
            local.pill,
            {
              backgroundColor: COLORS.YELLOW,
              opacity: on,
              transform: [{ scaleX: on.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }, { scaleY: on.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ translateY: on.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) }, { scale: on.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>
          <Ionicons name={(active ? tab.icon : `${tab.icon}-outline`) as any} size={20} color={active ? COLORS.INK : COLORS.TEXT_MUTED} />
        </Animated.View>
        <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {t(tab.label)}
        </Text>
      </Animated.View>
    </Pressable>
  )
}

const local = StyleSheet.create({
  // Mismo tamaño y radio que styles.navItem; el color sale de la paleta en cada render del botón.
  pill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
})
