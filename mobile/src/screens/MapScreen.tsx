import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { buildMapHtml } from '../lib/mapHtml'
import { MapBody } from '../components/MapBody'
import type { Destination } from '../lib/types'

type Props = {
  title: string
  points: Destination[]
  onBack: () => void
  /** Si viene en true, conecta los puntos con una línea en el orden del arreglo (la "ruta"). */
  drawRoute?: boolean
}

export function MapScreen({ title, points, onBack, drawRoute }: Props) {
  const ubicados = points.filter(
    (p): p is Destination & { latitude: number; longitude: number } =>
      typeof p.latitude === 'number' && typeof p.longitude === 'number' && !Number.isNaN(p.latitude),
  )
  const sinUbicacion = points.length - ubicados.length

  const html = buildMapHtml(
    ubicados.map((p) => ({ lat: p.latitude, lng: p.longitude, name: p.name.replace(/"/g, "'") })),
    Boolean(drawRoute),
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.CREAM }} edges={['top']}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle}>{title}</Text>
      </View>

      {ubicados.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="location-outline" size={60} color={COLORS.GRAY_LIGHT} />
          <Text style={styles.emptyTitle}>Todavía no hay lugares con ubicación para mostrar aquí.</Text>
        </View>
      ) : (
        <>
          <MapBody html={html} />
          {sinUbicacion > 0 && (
            <Text
              style={{
                padding: 10,
                fontSize: 11,
                fontFamily: 'Poppins_400Regular',
                color: COLORS.TEXT_MUTED,
                textAlign: 'center',
              }}
            >
              {sinUbicacion} lugar{sinUbicacion > 1 ? 'es' : ''} sin coordenadas registradas no se muestra en el
              mapa.
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  )
}
