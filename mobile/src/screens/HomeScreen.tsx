import React, { useEffect, useMemo, useState } from 'react'
import { View, Pressable, ScrollView, Dimensions } from 'react-native'
import { Image } from '../components/Img'
import { Text, TextInput } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { useTranslation } from 'react-i18next'
import { useApi } from '../lib/useApi'
import { prefetch } from '../lib/api'
import { PressableScale } from '../components/Transitions'
import { useNotifications } from '../lib/notifications'
import { toDestination } from '../lib/mappers'
import type { LugarResumenDto, PagedResult } from '../lib/types'

const { width } = Dimensions.get('window')

export function HomeScreen({ profileName, profilePhoto, onExplore, onCategory, onNotifications, onSelect }: any) {
  const { t } = useTranslation()
  const [activeSlide, setActiveSlide] = useState(0)
  const [search, setSearch] = useState('')
  const { unread } = useNotifications()

  // Con caché: al volver a Inicio desde otra pestaña se pinta al instante con lo ya cargado, sin repetir la consulta.
  const featuredApi = useApi<LugarResumenDto[]>('/api/v1/lugares/destacados?take=3')
  const cityApi = useApi<PagedResult<LugarResumenDto>>(`/api/v1/lugares?ciudad=${encodeURIComponent('Medellín')}&pageSize=6`)
  const featured = useMemo(() => (featuredApi.data ?? []).map(toDestination), [featuredApi.data])
  const destinations = useMemo(() => (cityApi.data?.items ?? []).map(toDestination), [cityApi.data])
  const error = featuredApi.error || cityApi.error

  // Con las tarjetas a la vista, se adelanta el detalle de cada lugar: al tocar una, abre al instante.
  useEffect(() => {
    const ids = [...featured, ...destinations].map((d) => d.id)
    if (ids.length === 0) return
    prefetch([...new Set(ids)].map((id) => `/api/v1/lugares/${encodeURIComponent(id)}/contenido`))
  }, [featured, destinations])

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / (width - 40))
    setActiveSlide(slide)
  }

  return (
    <View>
      <View style={styles.homeHeader}>
        <View style={styles.userSection}>
          <Image source={profilePhoto ? { uri: profilePhoto } : require('../../assets/normalized/Camilo.jpg')} style={styles.avatarHeader} />
          <Text style={styles.greetingText}>{t('home.hello', { name: profileName.split(' ')[0] })}</Text>
        </View>
        <Pressable style={styles.notifBtn} onPress={onNotifications}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.BLUE} />
          {unread > 0 && <View style={styles.notifDot} />}
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.TEXT_MUTED} />
        <TextInput
          placeholder={t('home.search')}
          placeholderTextColor={COLORS.TEXT_MUTED}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (search.trim()) onExplore(search.trim())
          }}
        />
      </View>

      <View style={styles.heroContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {featured.map((item) => (
            <View key={item.id} style={styles.heroCard}>
              <Image source={item.image} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <View style={styles.heroPanel}>
                  <View style={styles.heroCityRow}>
                    <Text style={styles.heroCity}>{item.city.toUpperCase()}</Text>
                    <Ionicons name="location" size={10} color={COLORS.YELLOW} style={{ marginLeft: 5 }} />
                  </View>
                  <Text style={styles.heroTitle} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.75}>{item.name}</Text>
                  <Text style={styles.heroSubtitle} numberOfLines={2}>{item.tagline}</Text>
                  <Pressable style={styles.heroButton} onPress={() => onSelect(item)}>
                    <Text style={[styles.heroButtonText, { flexShrink: 1 }]} numberOfLines={2}>{t('home.discover', { name: item.name })}</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.INK} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.heroDots}>
          {featured.map((_, i) => (
            <View key={i} style={[styles.dot, activeSlide === i && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.catRow}>
        {[
          { id: 'food', icon: 'restaurant', color: '#FFD100' },
          { id: 'culture', icon: 'home', color: '#003B7D' },
          { id: 'nature', icon: 'leaf', color: '#4CAF50' },
          { id: 'nightlife', icon: 'musical-notes', color: '#E63946' },
        ].map((item) => (
          <PressableScale key={item.id} style={styles.catItem} onPress={() => onCategory(item.id)} scaleTo={0.9}>
            <View style={[styles.catIcon, { backgroundColor: item.color === '#003B7D' ? COLORS.PRIMARY : item.color }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color === '#FFD100' ? COLORS.INK : '#FFF'} />
            </View>
            <Text style={styles.catLabel} numberOfLines={2}>{t(`categories.${item.id}`)}</Text>
          </PressableScale>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { flexShrink: 1, marginRight: 12 }]} numberOfLines={2}>{t('home.highlights', { city: 'Medellín' })}</Text>
        <Pressable onPress={() => onExplore('Medellín')}><Text style={styles.seeAllText}>{t('common.viewAll')}</Text></Pressable>
      </View>

      {error && destinations.length === 0 && (
        <Text style={{ color: COLORS.TEXT_MUTED, marginBottom: 12 }}>
          {t('common.noConnectionApi')}
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizList}>
        {destinations.map((item) => (
          <PressableScale key={item.id} style={styles.card} onPress={() => onSelect(item)}>
            <Image source={item.image} style={styles.cardImage} />
            <View style={styles.cardRating}>
              <Ionicons name="star" size={12} color={COLORS.YELLOW} />
              <Text style={styles.ratingValue}>{item.rating}</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardTag}><Text style={styles.cardTagText}>{t(`categories.${item.categorySlug}`, { defaultValue: item.category })}</Text></View>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.cardTagline}>{item.tagline}</Text>
              <View style={styles.cardLocation}>
                <Ionicons name="location" size={12} color={COLORS.BLUE} />
                <Text style={styles.cardLocationText}>{item.city}</Text>
              </View>
            </View>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  )
}
