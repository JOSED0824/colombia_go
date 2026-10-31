import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'

const NAV_HEIGHT = 90

const STEPS = [
  { tab: 'Inicio', key: 'onboarding.coachHome' },
  { tab: 'Explorar', key: 'onboarding.coachExplore' },
  { tab: 'Guías', key: 'onboarding.coachGuides' },
  { tab: 'IA', key: 'onboarding.coachAi' },
  { tab: 'Favoritos', key: 'onboarding.coachFavorites' },
  { tab: 'Perfil', key: 'onboarding.coachProfile' },
] as const

type Props = {
  /** Posición (x, ancho) de cada pestaña dentro de la barra inferior, medida por BottomNav. */
  tabLayouts: Record<string, { x: number; width: number }>
  /** App cambia a la pestaña que se está explicando, para que se vea de fondo. */
  onStep: (tab: string) => void
  onFinish: () => void
}

/**
 * Recorrido guiado: la pantalla se oscurece, la barra inferior queda a la vista con un aro sobre la
 * pestaña explicada y una tarjeta con el texto. Next/Skip. La barra no responde a toques mientras dura.
 */
export function CoachMarks({ tabLayouts, onStep, onFinish }: Props) {
  const { t } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const isLast = index === STEPS.length - 1

  // Si todavía no se midió la pestaña, se aproxima repartiendo la barra en 6 partes iguales.
  const layout = tabLayouts[step.tab] ?? { x: (screenWidth / STEPS.length) * index, width: screenWidth / STEPS.length }
  const center = layout.x + layout.width / 2
  const CARD_WIDTH = Math.min(screenWidth - 32, 380)
  const cardLeft = Math.min(Math.max(center - CARD_WIDTH / 2, 16), screenWidth - CARD_WIDTH - 16)

  function next() {
    if (isLast) {
      onFinish()
      return
    }
    const target = STEPS[index + 1].tab
    setIndex(index + 1)
    onStep(target)
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Fondo oscuro sobre el contenido (la barra inferior queda sin oscurecer) */}
      <View style={s.dim} />

      {/* Capa transparente sobre la barra: bloquea toques y dibuja el aro de la pestaña */}
      <View style={s.navCover}>
        <View style={[s.ring, { left: layout.x + 2, width: layout.width - 4 }]} />
      </View>

      <View style={[s.card, { width: CARD_WIDTH, left: cardLeft }]}>
        <Text style={s.cardText}>{t(step.key)}</Text>
        <View style={s.cardFooter}>
          <Text style={s.counter}>{t('onboarding.stepOf', { current: index + 1, total: STEPS.length })}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {!isLast && (
              <Pressable onPress={onFinish} hitSlop={10}>
                <Text style={s.skip}>{t('common.skip')}</Text>
              </Pressable>
            )}
            <Pressable style={s.nextBtn} onPress={next}>
              <Text style={s.nextText}>{isLast ? t('onboarding.finish') : t('common.next')}</Text>
              {!isLast && <Ionicons name="arrow-forward" size={16} color={COLORS.BLUE} />}
            </Pressable>
          </View>
        </View>
        {/* Flecha hacia la pestaña */}
        <View style={[s.arrow, { left: Math.min(Math.max(center - cardLeft - 9, 14), CARD_WIDTH - 32) }]} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: NAV_HEIGHT, backgroundColor: 'rgba(0,28,61,0.72)' },
  navCover: { position: 'absolute', left: 0, right: 0, bottom: 0, height: NAV_HEIGHT, backgroundColor: 'transparent' },
  ring: { position: 'absolute', top: 6, height: 58, borderRadius: 20, borderWidth: 3, borderColor: COLORS.YELLOW },
  card: { position: 'absolute', bottom: NAV_HEIGHT + 18, backgroundColor: '#FFF', borderRadius: 20, padding: 18 },
  cardText: { fontFamily: 'Poppins_500Medium', fontSize: 15, lineHeight: 22, color: COLORS.BLUE },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  counter: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: COLORS.TEXT_MUTED },
  skip: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.TEXT_MUTED },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.YELLOW, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16 },
  nextText: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: COLORS.BLUE },
  arrow: {
    position: 'absolute',
    bottom: -9,
    width: 18,
    height: 18,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
})
