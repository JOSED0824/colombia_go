import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, Pressable, Linking } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { FactItemCol } from '../components/FactItemCol'
import { apiGet } from '../lib/api'
import { toDestinationDetail } from '../lib/mappers'
import type { Destination, LugarDetalleDto } from '../lib/types'

export function DetailScreen({ destination: resumen, favorite, inRoute, onBack, onFavorite, onToggleRoute }: any) {
  // Se muestra de una vez lo que ya se tiene (nombre, foto, calificación) y se completa con el detalle de la API.
  const [detalle, setDetalle] = useState<Destination | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setDetalle(null)
    setError(false)
    apiGet<LugarDetalleDto>(`/api/v1/lugares/${encodeURIComponent(resumen.id)}`)
      .then((dto) => setDetalle(toDestinationDetail(dto)))
      .catch(() => setError(true))
  }, [resumen.id])

  const destination: Destination = detalle ?? resumen

  const openMaps = () => {
    const query = destination.latitude != null && destination.longitude != null
      ? `${destination.latitude},${destination.longitude}`
      : `${destination.name} ${destination.city}`
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`)
  }

  const descripcion = detalle
    ? destination.description
    : error ? 'No pudimos cargar la información de este lugar.' : 'Cargando…'

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.detailHero}>
          <Image source={destination.image} style={styles.detailImage} />
          <View style={styles.detailHeaderAbs}>
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
             <View style={styles.mapCard}>
                <View style={styles.mapInfo}>
                  <Text style={styles.mapPlaceName}>{destination.name}</Text>
                  {!!destination.address && <Text style={styles.mapPlaceSub} numberOfLines={2}>{destination.address}</Text>}
                  <Text style={styles.mapPlaceCity}>{destination.city}, {destination.region}</Text>
                </View>
                <View style={styles.mapGraphic}>
                   <View style={styles.mapLine} />
                   <View style={styles.mapPinContainer}>
                     <Ionicons name="location" size={24} color="#3B82F6" />
                   </View>
                   {destination.id === 'comuna-13' && (
                     <>
                       <View style={styles.landmark1}><Ionicons name="body" size={12} color={COLORS.TEXT_MUTED} /><Text style={styles.landmarkTxt}>Escaleras{"\n"}Eléctricas</Text></View>
                       <View style={styles.landmark2}><Ionicons name="bus" size={12} color={COLORS.TEXT_MUTED} /><Text style={styles.landmarkTxt}>Metrocable</Text></View>
                     </>
                   )}
                </View>
             </View>
          </View>

          <View style={styles.factRow}>
            <FactItemCol icon="time-outline" color="#3B82F6" label="Horarios:" value={destination.hours} />
            <FactItemCol icon="pricetag-outline" color="#10B981" label="Precio:" value={destination.price} />
            <FactItemCol icon="bus-outline" color="#8B5CF6" label="Cómo llegar:" value={destination.transport} />
          </View>

          <Pressable style={styles.primaryBtnLarge} onPress={openMaps}>
            <Text style={styles.primaryBtnText}>Ir a este lugar</Text>
            <Ionicons name="arrow-forward" size={24} color={COLORS.BLUE} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
