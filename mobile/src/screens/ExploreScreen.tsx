import React from 'react'
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { DestinationRow } from '../components/DestinationRow'

export function ExploreScreen({ category, setCategory, query, setQuery, destinations: items, favorites, savedRoutes, onSelect, onFavorite, onToggleRoute }: any) {
  return (
    <View>
       <Text style={styles.pageTitle}>Explorar</Text>
       <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.TEXT_MUTED} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Busca destinos..."
          placeholderTextColor={COLORS.TEXT_MUTED}
          style={styles.searchInput}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {['Todos', 'Cultura', 'Naturaleza', 'Gastronomía', 'Vida Nocturna'].map((cat) => (
          <Pressable key={cat} onPress={() => setCategory(cat)} style={[styles.filterChip, category === cat && styles.filterChipActive]}>
            <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {items.map((item: any) => (
        <DestinationRow
          key={item.id}
          destination={item}
          favorite={favorites.includes(item.id)}
          inRoute={savedRoutes.includes(item.id)}
          onPress={() => onSelect(item)}
          onFavorite={() => onFavorite(item.id)}
          onToggleRoute={() => onToggleRoute(item.id)}
        />
      ))}
    </View>
  )
}
