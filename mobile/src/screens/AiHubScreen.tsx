import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { AiRoutePlannerScreen } from './AiRoutePlannerScreen'
import { TravelGuideScreen } from './TravelGuideScreen'
import type { Destination } from '../lib/types'

type Props = {
  candidatos: Destination[]
  onViewOnMap: (points: Destination[], title: string, drawRoute?: boolean) => void
  onSaveStops: (ids: string[]) => Promise<boolean>
  onSelect: (destination: Destination) => void
}

type Tab = 'guide' | 'route'

/** Pestaña IA: la guía de viaje completa (principal) y el planificador de ruta por presupuesto. */
export function AiHubScreen({ candidatos, onViewOnMap, onSaveStops, onSelect }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('guide')

  return (
    <View>
      <View style={s.segment}>
        {(['guide', 'route'] as const).map((id) => {
          const active = tab === id
          return (
            <Pressable key={id} style={[s.segmentItem, active && s.segmentActive]} onPress={() => setTab(id)}>
              <Ionicons
                name={id === 'guide' ? 'sparkles' : 'navigate'}
                size={16}
                color={active ? COLORS.BLUE : COLORS.TEXT_MUTED}
              />
              <Text style={[s.segmentText, active && s.segmentTextActive]}>
                {id === 'guide' ? t('aiHub.guideTab') : t('aiHub.routeTab')}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {tab === 'guide' ? (
        <TravelGuideScreen onViewOnMap={(points, title) => onViewOnMap(points, title, true)} onSaveStops={onSaveStops} onSelect={onSelect} />
      ) : (
        <AiRoutePlannerScreen candidatos={candidatos} onViewOnMap={(points, title) => onViewOnMap(points, title, true)} />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  segment: { flexDirection: 'row', backgroundColor: '#E8EEF4', borderRadius: 22, padding: 4, marginBottom: 18 },
  segmentItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 18 },
  segmentActive: { backgroundColor: COLORS.YELLOW },
  segmentText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.TEXT_MUTED },
  segmentTextActive: { color: COLORS.BLUE, fontFamily: 'Poppins_700Bold' },
})
