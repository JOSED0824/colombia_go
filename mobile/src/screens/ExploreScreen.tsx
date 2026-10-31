import React from 'react'
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { useTranslation } from 'react-i18next'
import { DestinationRow } from '../components/DestinationRow'

export function ExploreScreen({ category, setCategory, query, setQuery, destinations: items, loading, error, favorites, savedRoutes, onSelect, onFavorite, onToggleRoute }: any) {
  const { t } = useTranslation()
  return (
    <View>
       <Text style={styles.pageTitle}>{t('explore.title')}</Text>
       <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.TEXT_MUTED} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('explore.search')}
          placeholderTextColor={COLORS.TEXT_MUTED}
          style={styles.searchInput}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {['all', 'culture', 'nature', 'food', 'nightlife'].map((cat) => (
          <Pressable key={cat} onPress={() => setCategory(cat)} style={[styles.filterChip, category === cat && styles.filterChipActive]}>
            <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>{t(`categories.${cat}`)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading && items.length === 0 && <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 30 }} />}
      {!loading && error && (
        <Text style={{ textAlign: 'center', color: COLORS.TEXT_MUTED, marginTop: 30 }}>
          {t('common.noConnection')}
        </Text>
      )}
      {!loading && !error && items.length === 0 && (
        <Text style={{ textAlign: 'center', color: COLORS.TEXT_MUTED, marginTop: 30 }}>
          {t('explore.empty')}
        </Text>
      )}
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
