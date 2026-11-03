import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Pressable, ScrollView, Dimensions, Animated, Easing } from 'react-native'
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
import type { Destination, LugarResumenDto, PagedResult } from '../lib/types'

const { width } = Dimensions.get('window')
const SLIDE_WIDTH = width - 40
const AUTOPLAY_MS = 5500

// Cada vez que se abre la app el orden de los destacados y de los imperdibles cambia: el inicio se siente vivo sin
// agregar secciones. La semilla es fija durante la sesión, así no se reordena al volver a la pestaña.
const SESSION_SEED = Math.floor(Math.random() * 2 ** 31)
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items]
  let s = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function partOfDay() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 19 ? 'afternoon' : 'evening'
}

export function HomeScreen({ profileName, profilePhoto, onExplore, onCategory, onNotifications, onSelect }: any) {
  const { t } = useTranslation()
  const [activeSlide, setActiveSlide] = useState(0)
  const [search, setSearch] = useState('')
  const { unread } = useNotifications()

  // Con caché: al volver a Inicio desde otra pestaña se pinta al instante con lo ya cargado, sin repetir la consulta.
  const featuredApi = useApi<LugarResumenDto[]>('/api/v1/lugares/destacados?take=6')
  const cityApi = useApi<PagedResult<LugarResumenDto>>(`/api/v1/lugares?ciudad=${encodeURIComponent('Medellín')}&pageSize=8`)
  const featured = useMemo(() => shuffle((featuredApi.data ?? []).map(toDestination), SESSION_SEED).slice(0, 5), [featuredApi.data])
  const destinations = useMemo(() => shuffle((cityApi.data?.items ?? []).map(toDestination), SESSION_SEED + 7), [cityApi.data])
  const error = featuredApi.error || cityApi.error

  // Con las tarjetas a la vista, se adelanta el detalle de cada lugar: al tocar una, abre al instante.
  useEffect(() => {
    const ids = [...featured, ...destinations].map((d) => d.id)
    if (ids.length === 0) return
    prefetch([...new Set(ids)].map((id) => `/api/v1/lugares/${encodeURIComponent(id)}/contenido`))
  }, [featured, destinations])

  // Carrusel que avanza solo; si la persona lo toca, se pausa un rato para no pelearle el dedo.
  const heroRef = useRef<React.ComponentRef<typeof ScrollView>>(null)
  const pausedUntil = useRef(0)
  useEffect(() => {
    if (featured.length < 2) return
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return
      setActiveSlide((current) => {
        const next = (current + 1) % featured.length
        heroRef.current?.scrollTo({ x: next * SLIDE_WIDTH, animated: true })
        return next
      })
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [featured.length])

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH)
    if (slide !== activeSlide) setActiveSlide(slide)
  }

  const suggestions = useMemo(() => [...featured, ...destinations].map((d) => d.name).slice(0, 8), [featured, destinations])

  return (
    <View>
      <View style={styles.homeHeader}>
        <View style={styles.userSection}>
          <Image source={profilePhoto ? { uri: profilePhoto } : require('../../assets/normalized/Camilo.jpg')} style={styles.avatarHeader} />
          <View style={{ marginLeft: 12, flexShrink: 1 }}>
            <Text style={styles.greetingSmall}>{t(`home.${partOfDay()}`)}</Text>
            <Text style={styles.greetingName} numberOfLines={1}>{profileName.split(' ')[0]} 👋</Text>
          </View>
        </View>
        <Pressable style={styles.notifBtn} onPress={onNotifications}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.BLUE} />
          {unread > 0 && <View style={styles.notifDot} />}
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.TEXT_MUTED} />
        <View style={{ flex: 1 }}>
          {!search && <RotatingPlaceholder fallback={t('home.search')} items={suggestions.map((name) => t('home.tryIt', { name }))} />}
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (search.trim()) onExplore(search.trim())
            }}
          />
        </View>
      </View>

      <View style={styles.heroContainer}>
        <ScrollView
          ref={heroRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={() => (pausedUntil.current = Date.now() + 9000)}
          scrollEventThrottle={16}
        >
          {featured.map((item, i) => (
            <HeroSlide key={item.id} item={item} active={i === activeSlide} onSelect={onSelect} />
          ))}
        </ScrollView>
        <View style={styles.heroDots}>
          {featured.map((item, i) => (
            <Dot key={item.id} active={activeSlide === i} />
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
        {destinations.map((item, index) => (
          <FadeIn key={item.id} delay={index * 80}>
            <PressableScale style={styles.card} onPress={() => onSelect(item)}>
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
          </FadeIn>
        ))}
      </ScrollView>
    </View>
  )
}

/** Diapositiva del carrusel: la foto se acerca despacio (efecto "Ken Burns") y el panel entra cuando es la activa. */
function HeroSlide({ item, active, onSelect }: { item: Destination; active: boolean; onSelect: (d: Destination) => void }) {
  const { t } = useTranslation()
  const zoom = useRef(new Animated.Value(0)).current
  const panel = useRef(new Animated.Value(active ? 1 : 0)).current

  useEffect(() => {
    if (active) {
      zoom.setValue(0)
      const anim = Animated.timing(zoom, { toValue: 1, duration: AUTOPLAY_MS + 1500, easing: Easing.out(Easing.quad), useNativeDriver: true })
      anim.start()
      Animated.spring(panel, { toValue: 1, speed: 12, bounciness: 6, useNativeDriver: true }).start()
      return () => anim.stop()
    }
    Animated.timing(panel, { toValue: 0, duration: 200, useNativeDriver: true }).start()
  }, [active, zoom, panel])

  return (
    <View style={styles.heroCard}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transform: [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }}>
        <Image source={item.image} style={styles.heroImage} />
      </Animated.View>
      <View style={styles.heroOverlay}>
        <Animated.View
          style={[
            styles.heroPanel,
            { opacity: panel.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }), transform: [{ translateY: panel.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
          ]}
        >
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
        </Animated.View>
      </View>
    </View>
  )
}

/** Punto del carrusel: el activo se alarga con una transición suave. */
function Dot({ active }: { active: boolean }) {
  const v = useRef(new Animated.Value(active ? 1 : 0)).current
  useEffect(() => {
    Animated.timing(v, { toValue: active ? 1 : 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: false }).start()
  }, [active, v])
  return (
    <Animated.View
      style={{
        height: 6,
        borderRadius: 3,
        width: v.interpolate({ inputRange: [0, 1], outputRange: [6, 20] }),
        backgroundColor: v.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.45)', 'rgba(255,255,255,1)'] }),
      }}
    />
  )
}

/** Sugerencias del buscador que van cambiando con un fundido ("Prueba «Comuna 13»"…). */
function RotatingPlaceholder({ items, fallback }: { items: string[]; fallback: string }) {
  const [index, setIndex] = useState(-1) // -1 = el texto de siempre ("¿Qué quieres descubrir hoy?")
  const fade = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (items.length === 0) return
    const timer = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1 >= items.length ? -1 : i + 1))
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start()
      })
    }, 3200)
    return () => clearInterval(timer)
  }, [items.length, fade])
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', opacity: fade }}>
      <Text style={[styles.searchInput, { color: COLORS.TEXT_MUTED }]} numberOfLines={1}>
        {index < 0 ? fallback : items[index]}
      </Text>
    </Animated.View>
  )
}

/** Las tarjetas aparecen escalonadas la primera vez que llegan los datos. */
function FadeIn({ delay, children }: { delay: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 380, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [v, delay])
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>{children}</Animated.View>
  )
}
