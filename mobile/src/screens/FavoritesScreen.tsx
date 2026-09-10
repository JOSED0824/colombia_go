import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { DestinationRow } from '../components/DestinationRow'

export function FavoritesScreen({ destinations: items, onSelect, onFavorite, onToggleRoute, inRoutes, onNavigate }: any) {
  return (
    <View>
      <Text style={styles.pageTitle}>Mis Favoritos</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={60} color={COLORS.GRAY_LIGHT} />
          <Text style={styles.emptyTitle}>Aún no tienes favoritos</Text>
          <Pressable style={styles.emptyBtn} onPress={() => onNavigate('Explorar')}><Text style={styles.emptyBtnText}>Explorar ahora</Text></Pressable>
        </View>
      ) : (
        items.map((item: any) => (
          <DestinationRow
            key={item.id}
            destination={item}
            favorite={true}
            inRoute={inRoutes.includes(item.id)}
            onPress={() => onSelect(item)}
            onFavorite={() => onFavorite(item.id)}
            onToggleRoute={() => onToggleRoute(item.id)}
          />
        ))
      )}
    </View>
  )
}
