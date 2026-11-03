import React from 'react'
import { Pressable, View } from 'react-native'
import { Image } from './Img'
import { Text } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { PressableScale } from './Transitions'

export function DestinationRow({ destination, favorite, inRoute, onPress, onFavorite, onToggleRoute }: any) {
  return (
    <PressableScale style={styles.rowCard} onPress={onPress} scaleTo={0.97}>
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
    </PressableScale>
  )
}
