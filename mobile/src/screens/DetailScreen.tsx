import React, { useEffect, useMemo } from 'react'
import { View, ScrollView, Pressable, Linking } from 'react-native'
import { Image } from '../components/Img'
import { Text } from '../components/AppText'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { FactItemCol } from '../components/FactItemCol'
import { useTranslation } from 'react-i18next'
import { apiSend } from '../lib/api'
import { useApi } from '../lib/useApi'
import { MiniMap } from '../components/MiniMap'
import { toDestinationDetail } from '../lib/mappers'
import type { Destination, LugarDetalleDto } from '../lib/types'

export function DetailScreen({ destination: resumen, favorite, inRoute, onBack, onFavorite, onToggleRoute }: any) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  // Se muestra de una vez lo que ya se tiene (nombre, foto, calificación) y se completa con el detalle de la API.
  // "/contenido" es el detalle igual para todos: el servidor lo guarda en caché y la app lo reutiliza al volver.
  const { data: dto, error } = useApi<LugarDetalleDto>(`/api/v1/lugares/${encodeURIComponent(resumen.id)}/contenido`)
  const detalle = useMemo(() => (dto ? toDestinationDetail(dto) : null), [dto])

  // El historial de lugares vistos (alimenta las recomendaciones) se avisa aparte, sin esperar ni bloquear la pantalla.
  useEffect(() => {
    apiSend(`/api/v1/lugares/${encodeURIComponent(resumen.id)}/vista`, 'POST', undefined, { keepCache: true }).catch(() => {})
  }, [resumen.id])

  const destination: Destination = detalle ?? resumen
  const hasLocation = typeof destination.latitude === 'number' && typeof destination.longitude === 'number' && !Number.isNaN(destination.latitude)

  const openMaps = () => {
    const query = destination.latitude != null && destination.longitude != null
      ? `${destination.latitude},${destination.longitude}`
      : `${destination.name} ${destination.city}`
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`)
  }

  const descripcion = detalle
    ? destination.description
    : error ? t('detail.cantLoad') : t('detail.loading')

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
      <StatusBar style="light" />
      {/* paddingBottom: la barra inferior es absoluta (90 de alto); sin este espacio el botón final queda tapado y el scroll rebota. */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={styles.detailHero}>
          <Image source={destination.image} style={styles.detailImage} />
          <View style={[styles.detailHeaderAbs, { top: insets.top + 8 }]}>
            <Pressable style={styles.fabBack} onPress={onBack}>
              <Ionicons name="chevron-back" size={24} color={COLORS.BLUE} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={styles.fabBack} onPress={onToggleRoute}>
                <Ionicons name={inRoute ? "map" : "map-outline"} size={22} color={inRoute ? COLORS.YELLOW : COLORS.BLUE} />
              </Pressable>
              <Pressable style={styles.fabBack} onPress={onFavorite}>
                <Ionicons name={favorite ? "heart" : "heart-outline"} size={24} color={favorite ? COLORS.RED : COLORS.BLUE} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.detailContainer}>
          <View style={styles.handle} />
          <View style={styles.detailLogoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{destination.name}</Text>
              <View style={styles.detailStars}>
                <Ionicons name="star" size={18} color={COLORS.YELLOW} />
                <Text style={styles.detailRatingTxt}>{destination.rating} <Text style={{ color: COLORS.TEXT_MUTED, fontWeight: '400', fontSize: 13 }}>({destination.reviewsLabel})</Text></Text>
              </View>
            </View>
            <View style={styles.brandContainer}>
              <Image source={require('../../assets/normalized/Logo-oficial-Colombia-GO.jpeg')} style={styles.detailBrandLogo} />
              <Text style={styles.brandText}>COLOMBIAGO</Text>
            </View>
          </View>

          <Text style={styles.detailDesc}>{descripcion}</Text>

          <View style={styles.mapContainer}>
            {hasLocation ? (
              <MiniMap
                latitude={destination.latitude as number}
                longitude={destination.longitude as number}
                category={destination.category}
                onPress={openMaps}
              />
            ) : null}
            <View style={styles.detailMapInfo}>
              <View style={styles.detailMapPin}>
                <Ionicons name="location" size={20} color={COLORS.BLUE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapPlaceName} numberOfLines={1}>{destination.name}</Text>
                {!!destination.address && <Text style={styles.mapPlaceSub} numberOfLines={2}>{destination.address}</Text>}
                {!destination.address?.includes(destination.city) && (
                  <Text style={styles.mapPlaceCity}>{destination.city}, {destination.region}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.factRow}>
            <FactItemCol icon="time-outline" color="#3B82F6" label={t('detail.hours')} value={destination.hours} />
            <FactItemCol icon="pricetag-outline" color="#10B981" label={t('detail.price')} value={destination.price} />
            <FactItemCol icon="bus-outline" color="#8B5CF6" label={t('detail.howToGet')} value={destination.transport} />
          </View>

          <Pressable style={styles.primaryBtnLarge} onPress={openMaps}>
            <Text style={styles.primaryBtnText}>{t('detail.goThere')}</Text>
            <Ionicons name="arrow-forward" size={24} color={COLORS.INK} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
