import React from 'react'
import { Pressable, Image, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

export function DestinationRow({ destination, favorite, inRoute, onPress, onFavorite, onToggleRoute }: any) {
  return (
    <Pressable style={styles.rowCard} onPress={onPress}>
      <Image source={destination.image} style={styles.rowImg} />
      <View style={styles.rowContent}>
        <Text style={styles.rowName}>{destination.name}</Text>
        <Text style={styles.rowLoc}>{destination.city} · ★ {destination.rating}</Text>
        <Text style={styles.rowTag} numberOfLines={1}>{destination.tagline}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={onToggleRoute}><Ionicons name={inRoute ? "map" : "map-outline"} size={22} color={inRoute ? COLORS.YELLOW : COLORS.TEXT_MUTED} /></Pressable>
        <Pressable onPress={onFavorite}><Ionicons name={favorite ? "heart" : "heart-outline"} size={22} color={favorite ? COLORS.RED : COLORS.TEXT_MUTED} /></Pressable>
      </View>
    </Pressable>
  )
}
