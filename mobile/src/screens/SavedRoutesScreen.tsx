import React from 'react'
import { View, ScrollView, Pressable, Image } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { useTranslation } from 'react-i18next'
import type { Destination } from '../lib/types'

export function SavedRoutesScreen({ paradas, onSelect, onNavigate, onViewMap }: any) {
  const { t } = useTranslation()
  const saved: Destination[] = paradas

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.guidesHeader}>
        <View>
          <Text style={styles.guidesTitle}>{t('routes.title')}</Text>
          <View style={styles.flagLine}>
            <View style={[styles.flagColor, { backgroundColor: COLORS.YELLOW }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.BLUE }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.RED }]} />
          </View>
        </View>
        {saved.length > 0 && (
          <Pressable onPress={onViewMap}>
            <Ionicons name="map-outline" size={24} color={COLORS.BLUE} />
          </Pressable>
        )}
      </View>

      {saved.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="navigate-outline" size={60} color={COLORS.GRAY_LIGHT} />
          </View>
          <Text style={styles.emptyTitle}>{t('routes.emptyTitle')}</Text>
          <Text style={styles.emptyDesc}>{t('routes.emptyDesc')}</Text>
          <Pressable style={styles.emptyButton} onPress={() => onNavigate('Explorar')}>
            <Text style={styles.emptyButtonText}>{t('routes.explorePlaces')}</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.routeInfoCard}>
            <Ionicons name="sparkles" size={20} color={COLORS.YELLOW} />
            <Text style={styles.routeInfoText}>{t('routes.stops', { count: saved.length })}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {saved.map((item, index) => (
              <View key={item.id} style={styles.routeItemContainer}>
                {index !== saved.length - 1 && <View style={styles.routeLine} />}
                <View style={styles.routeStepIndicator}>
                  <Text style={styles.routeStepText}>{index + 1}</Text>
                </View>
                <Pressable style={styles.routeCard} onPress={() => onSelect(item)}>
                  <Image source={item.image} style={styles.routeImg} />
                  <View style={styles.routeContent}>
                    <Text style={styles.routeName}>{item.name}</Text>
                    <Text style={styles.routeLoc}>{item.city} · {t(`categories.${item.categorySlug}`, { defaultValue: item.category })}</Text>
                    <View style={styles.routeBadges}>
                      <View style={styles.routeBadge}><Text style={styles.routeBadgeText}>★ {item.rating}</Text></View>
                      <View style={[styles.routeBadge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.routeBadgeText, { color: '#2E7D32' }]}>{item.reviewsLabel}</Text></View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.BLUE} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
