import React, { useEffect, useRef } from 'react'
import { Animated, Easing, Image, Pressable, View, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'
import { badgeImage } from '../lib/badges'
import { successFeedback } from '../lib/haptics'
import type { LogroDto } from '../lib/types'

const BUBBLE = 64
const VISIBLE_MS = 5500

/**
 * Burbuja de "insignia desbloqueada": aparece arriba como un círculo con la insignia que rebota, se despliega hacia los
 * lados mostrando el nombre y, tras unos segundos, se recoge. Al tocarla abre las notificaciones.
 */
export function AchievementBubble({ logro, onOpen, onDismiss }: { logro: LogroDto; onOpen: () => void; onDismiss: () => void }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const fullWidth = Math.min(Dimensions.get('window').width - 32, 420)

  const pop = useRef(new Animated.Value(0)).current // aparición del círculo (nativo)
  const open = useRef(new Animated.Value(0)).current // despliegue del ancho (JS: el ancho no puede ir por el driver nativo)
  const glow = useRef(new Animated.Value(0)).current // pulso de brillo alrededor de la insignia (nativo)
  const closing = useRef(false)

  function close(after?: () => void) {
    if (closing.current) return
    closing.current = true
    Animated.timing(open, { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: false }).start(() =>
      Animated.timing(pop, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        after?.()
        onDismiss()
      }),
    )
  }

  useEffect(() => {
    successFeedback()
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, speed: 14, bounciness: 14, useNativeDriver: true }),
      Animated.delay(120),
    ]).start()
    Animated.timing(open, { toValue: 1, duration: 420, delay: 380, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start()
    const timer = setTimeout(() => close(), VISIBLE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const badge = badgeImage(logro.icon)
  const title = t(`achievements.${logro.id}.title`, { defaultValue: logro.title })

  return (
    <View pointerEvents="box-none" style={[local.wrap, { top: insets.top + 10 }]}>
      <Animated.View
        style={{
          opacity: pop,
          transform: [
            { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
            { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) },
          ],
        }}
      >
        <Animated.View style={[local.bubble, { width: open.interpolate({ inputRange: [0, 1], outputRange: [BUBBLE + 12, fullWidth] }) }]}>
          <Pressable style={local.press} onPress={() => close(onOpen)}>
            <View style={local.badgeWrap}>
              <Animated.View
                style={[
                  local.glow,
                  {
                    opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] }),
                    transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) }],
                  },
                ]}
              />
              {badge ? <Image source={badge} style={local.badge} /> : <Text style={{ fontSize: 30 }}>{logro.icon}</Text>}
            </View>
            <Animated.View style={[local.texts, { opacity: open.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] }) }]}>
              <Text style={local.kicker} numberOfLines={1}>{t('achievementToast.title')}</Text>
              <Text style={local.name} numberOfLines={1}>{title}</Text>
              <Text style={local.tap} numberOfLines={1}>{t('achievementToast.tap')}</Text>
            </Animated.View>
            <Animated.View style={{ opacity: open }}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.INK} />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const local = themed(() =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 60, elevation: 60 },
    bubble: { height: BUBBLE + 12, borderRadius: (BUBBLE + 12) / 2, backgroundColor: COLORS.YELLOW, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
    press: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 6, paddingRight: 16 },
    badgeWrap: { width: BUBBLE, height: BUBBLE, alignItems: 'center', justifyContent: 'center' },
    glow: { position: 'absolute', width: BUBBLE, height: BUBBLE, borderRadius: BUBBLE / 2, backgroundColor: '#FFFFFF' },
    badge: { width: BUBBLE - 8, height: BUBBLE - 8, resizeMode: 'contain' },
    texts: { flex: 1, marginLeft: 10, minWidth: 0 },
    kicker: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: COLORS.INK, opacity: 0.75 },
    name: { fontSize: 16, fontFamily: 'Poppins_800ExtraBold', color: COLORS.INK },
    tap: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: COLORS.INK, opacity: 0.8 },
  }),
)
