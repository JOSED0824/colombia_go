import React from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { useTranslation } from 'react-i18next'
import { DestinationRow } from '../components/DestinationRow'

export function FavoritesScreen({ destinations: items, onSelect, onFavorite, onToggleRoute, inRoutes, onNavigate, onViewMap }: any) {
  const { t } = useTranslation()
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.pageTitle}>{t('favorites.title')}</Text>
        {items.length > 0 && (
          <Pressable onPress={onViewMap}>
            <Ionicons name="map-outline" size={24} color={COLORS.BLUE} />
          </Pressable>
        )}
      </View>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={60} color={COLORS.GRAY_LIGHT} />
          <Text style={styles.emptyTitle}>{t('favorites.empty')}</Text>
          <Pressable style={styles.emptyBtn} onPress={() => onNavigate('Explorar')}><Text style={styles.emptyBtnText}>{t('favorites.exploreNow')}</Text></Pressable>
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
