import React, { useCallback, useMemo } from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '../components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, getThemeMode } from '../theme/colors'
import { styles } from '../theme/styles'
import { useTranslation } from 'react-i18next'
import { buildMapHtml, type MapLabels } from '../lib/mapHtml'
import { assetUrl } from '../lib/assetUrl'
import { MapBody } from '../components/MapBody'
import type { Destination } from '../lib/types'

// Alto de la barra de navegación inferior (position: absolute en theme/styles.ts).
const NAV_HEIGHT = 90

type Props = {
  title: string
  points: Destination[]
  onBack: () => void
  /** Si viene en true, conecta los puntos con la ruta por calle en el orden del arreglo y los numera. */
  drawRoute?: boolean
  /** Se llama cuando la persona toca "Ver detalle" en la tarjeta de un lugar del mapa. */
  onSelect?: (destination: Destination) => void
}

export function MapScreen({ title, points, onBack, drawRoute, onSelect }: Props) {
  const { t, i18n } = useTranslation()
  const ubicados = useMemo(
    () =>
      points.filter(
        (p): p is Destination & { latitude: number; longitude: number } =>
          typeof p.latitude === 'number' && typeof p.longitude === 'number' && !Number.isNaN(p.latitude),
      ),
    [points],
  )
  const sinUbicacion = points.length - ubicados.length
  const dark = getThemeMode() === 'dark'

  const html = useMemo(() => {
    const labels: MapLabels = {
      viewDetail: t('map.viewDetail'),
      fitAll: t('map.fitAll'),
      myLocation: t('map.myLocation'),
      drive: t('map.drive'),
      walk: t('map.walk'),
      bike: t('map.bike'),
      routeLoading: t('map.routeLoading'),
      routeFailed: t('map.routeFailed'),
      geoFailed: t('map.geoFailed'),
      mapFailed: t('map.mapFailed'),
      loading: t('map.loading'),
      stopsLabel: t('map.stopsCount', { count: ubicados.length }),
    }
    return buildMapHtml(
      ubicados.map((p) => ({
        id: p.id,
        lat: p.latitude,
        lng: p.longitude,
        name: p.name,
        city: p.city,
        category: p.categorySlug,
        categoryLabel: t(`categories.${p.categorySlug}`, { defaultValue: p.category }),
        rating: p.rating,
        image: assetUrl(p.image),
      })),
      Boolean(drawRoute),
      labels,
      dark,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicados, drawRoute, i18n.language, dark])

  const handleMessage = useCallback(
    (data: string) => {
      try {
        const msg = JSON.parse(data)
        if (msg?.type === 'select') {
          const found = ubicados.find((p) => p.id === msg.id)
          if (found) onSelect?.(found)
        }
      } catch {
        // mensaje que no es del mapa
      }
    },
    [ubicados, onSelect],
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
          <Text style={styles.emptyTitle}>{t('map.empty')}</Text>
        </View>
      ) : (
        <>
          {/* marginBottom: la barra inferior es absoluta (90 de alto); sin él las tarjetas del carrusel quedan tapadas por ella. */}
          <View style={{ flex: 1, marginBottom: sinUbicacion > 0 ? 0 : NAV_HEIGHT }}>
            <MapBody html={html} onMessage={handleMessage} />
          </View>
          {sinUbicacion > 0 && (
            <Text
              style={{
                padding: 10,
                paddingBottom: NAV_HEIGHT,
                fontSize: 11,
                fontFamily: 'Poppins_400Regular',
                color: COLORS.TEXT_MUTED,
                textAlign: 'center',
              }}
            >
              {t('map.hidden', { count: sinUbicacion })}
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  )
}
