import React, { useMemo } from 'react'
import { View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, getThemeMode } from '../theme/colors'
import { buildMiniMapHtml } from '../lib/miniMapHtml'
import { MapBody } from './MapBody'

type Props = {
  latitude: number
  longitude: number
  category: string
  /** Se llama al tocar el mapa (el detalle abre la app de mapas con la ruta hasta el lugar). */
  onPress: () => void
}

/** Mapa real con la ubicación del lugar, de tamaño fijo. Una capa transparente recibe los toques para que el scroll de la pantalla no se trabe con el WebView. */
export function MiniMap({ latitude, longitude, category, onPress }: Props) {
  const dark = getThemeMode() === 'dark'
  const html = useMemo(() => buildMiniMapHtml(latitude, longitude, category, dark), [latitude, longitude, category, dark])

  return (
    <View style={{ height: 190, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.BORDER, backgroundColor: COLORS.GRAY_LIGHT }}>
      <MapBody html={html} />
      <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onPress} />
      <View
        pointerEvents="none"
        style={{ position: 'absolute', right: 10, top: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.CARD, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6 }}
      >
        <Ionicons name="expand-outline" size={18} color={COLORS.BLUE} />
      </View>
    </View>
  )
}
