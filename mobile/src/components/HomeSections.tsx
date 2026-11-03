import React, { useEffect, useMemo, useRef } from 'react'
import { View, Pressable, ScrollView, StyleSheet, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Image } from './Img'
import { Text } from './AppText'
import { PressableScale } from './Transitions'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'
import { styles } from '../theme/styles'
import { useApi } from '../lib/useApi'
import { toDestination } from '../lib/mappers'
import { toGuia, type Guia } from '../lib/guides'
import type { Destination, GuiaDto, LugarResumenDto, PagedResult } from '../lib/types'

type Props = {
  seed: number
  shuffle: <T>(items: T[], seed: number) => T[]
  onSelect: (d: Destination) => void
  onCategory: (slug: string) => void
  onExplore: (query: string) => void
  onOpenGuide: (g: Guia) => void
  onOpenAi: () => void
}

/**
 * Secciones del inicio debajo de "Imperdibles": todas salen de dos consultas que ya usa la app (todos los lugares y los
 * guías, con caché), así que agregan contenido para recorrer sin hacer más lenta la pantalla. El orden dentro de cada
 * sección cambia en cada sesión.
 */
export function HomeSections({ seed, shuffle, onSelect, onCategory, onExplore, onOpenGuide, onOpenAi }: Props) {
  const { t } = useTranslation()
  const placesApi = useApi<PagedResult<LugarResumenDto>>('/api/v1/lugares?pageSize=50')
  const guidesApi = useApi<GuiaDto[]>('/api/v1/guias')

  const places = useMemo(() => (placesApi.data?.items ?? []).map(toDestination), [placesApi.data])
  const guides = useMemo(() => shuffle((guidesApi.data ?? []).map(toGuia), seed + 3), [guidesApi.data, seed, shuffle])

  const topRated = useMemo(() => [...places].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 8), [places])
  const byCategory = (slug: string, salt: number) => shuffle(places.filter((p) => p.categorySlug === slug), seed + salt).slice(0, 8)
  const nature = useMemo(() => byCategory('nature', 11), [places, seed])
  const food = useMemo(() => byCategory('food', 13), [places, seed])
  const nightlife = useMemo(() => byCategory('nightlife', 17), [places, seed])
  const culture = useMemo(() => byCategory('culture', 19), [places, seed])

  // Ciudades con su cantidad de lugares y la foto del primero, para las tarjetas de "Explora por ciudad".
  const cities = useMemo(() => {
    const map = new Map<string, { name: string; count: number; image: any }>()
    for (const p of places) {
      const c = map.get(p.city)
      if (c) c.count++
      else map.set(p.city, { name: p.city, count: 1, image: p.image })
    }
    return shuffle([...map.values()], seed + 23)
  }, [places, seed, shuffle])

  if (places.length === 0 && guides.length === 0) return null

  return (
    <View>
      <AiBanner onPress={onOpenAi} />

      <Section title={t('home.topRated')} icon="trophy" onSeeAll={() => onExplore('')}>
        {topRated.map((p, i) => <PlaceCard key={p.id} place={p} index={i} rank={i + 1} onPress={() => onSelect(p)} />)}
      </Section>

      {cities.length > 1 && (
        <Section title={t('home.byCity')} icon="business">
          {cities.map((c, i) => (
            <FadeIn key={c.name} delay={i * 60}>
              <PressableScale style={local.city} onPress={() => onExplore(c.name)}>
                <Image source={c.image} style={StyleSheet.absoluteFill} />
                <View style={local.cityShade} />
                <Text style={local.cityName} numberOfLines={1}>{c.name}</Text>
                <Text style={local.cityCount}>{t('home.placesCount', { count: c.count })}</Text>
              </PressableScale>
            </FadeIn>
          ))}
        </Section>
      )}

      {guides.length > 0 && (
        <Section title={t('home.guides')} icon="people">
          {guides.map((g, i) => (
            <FadeIn key={g.id} delay={i * 60}>
              <PressableScale style={local.guide} onPress={() => onOpenGuide(g)}>
                <Image source={g.image} style={local.guideImg} />
                <Text style={local.guideName} numberOfLines={1}>{g.name}</Text>
                <Text style={local.guideSpec} numberOfLines={1}>{g.specialty}</Text>
                <View style={local.guideRow}>
                  <Ionicons name="star" size={12} color={COLORS.YELLOW} />
                  <Text style={local.guideRating}>{g.rating}</Text>
                  <Text style={local.guidePrice}>{g.price}</Text>
                </View>
              </PressableScale>
            </FadeIn>
          ))}
        </Section>
      )}

      {nature.length > 0 && (
        <Section title={t('home.nature')} icon="leaf" onSeeAll={() => onCategory('nature')}>
          {nature.map((p, i) => <PlaceCard key={p.id} place={p} index={i} onPress={() => onSelect(p)} />)}
        </Section>
      )}
      {food.length > 0 && (
        <Section title={t('home.food')} icon="restaurant" onSeeAll={() => onCategory('food')}>
          {food.map((p, i) => <PlaceCard key={p.id} place={p} index={i} onPress={() => onSelect(p)} />)}
        </Section>
      )}
      {culture.length > 0 && (
        <Section title={t('home.culture')} icon="color-palette" onSeeAll={() => onCategory('culture')}>
          {culture.map((p, i) => <PlaceCard key={p.id} place={p} index={i} onPress={() => onSelect(p)} />)}
        </Section>
      )}
      {nightlife.length > 0 && (
        <Section title={t('home.nightlife')} icon="musical-notes" onSeeAll={() => onCategory('nightlife')}>
          {nightlife.map((p, i) => <PlaceCard key={p.id} place={p} index={i} onPress={() => onSelect(p)} />)}
        </Section>
      )}
    </View>
  )
}

function Section({ title, icon, onSeeAll, children }: { title: string; icon: string; onSeeAll?: () => void; children: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <View style={{ marginTop: 26 }}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <View style={local.sectionIcon}><Ionicons name={icon as any} size={16} color={COLORS.INK} /></View>
          <Text style={[styles.sectionTitle, { flexShrink: 1, fontSize: 20 }]} numberOfLines={2}>{title}</Text>
        </View>
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text style={styles.seeAllText}>{t('common.viewAll')}</Text>
          </Pressable>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6, gap: 14 }}>
        {children}
      </ScrollView>
    </View>
  )
}

function PlaceCard({ place, index, rank, onPress }: { place: Destination; index: number; rank?: number; onPress: () => void }) {
  const { t } = useTranslation()
  return (
    <FadeIn delay={index * 60}>
      <PressableScale style={local.place} onPress={onPress}>
        <View>
          <Image source={place.image} style={local.placeImg} />
          {rank !== undefined && (
            <View style={local.rank}><Text style={local.rankText}>#{rank}</Text></View>
          )}
          <View style={local.placeRating}>
            {Number(place.rating) > 0 ? (
              <>
                <Ionicons name="star" size={11} color={COLORS.YELLOW} />
                <Text style={local.placeRatingText}>{place.rating}</Text>
              </>
            ) : (
              <Text style={local.placeRatingText}>{t('home.new')}</Text>
            )}
          </View>
        </View>
        <View style={{ padding: 12 }}>
          <Text style={local.placeName} numberOfLines={2}>{place.name}</Text>
          <Text style={local.placeMeta} numberOfLines={1}>
            {place.city} · {t(`categories.${place.categorySlug}`, { defaultValue: place.category })}
          </Text>
        </View>
      </PressableScale>
    </FadeIn>
  )
}

/** Tarjeta grande que invita a la guía de viaje con IA; el ícono "respira" para llamar la atención. */
function AiBanner({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation()
  const pulse = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])
  return (
    <PressableScale style={local.ai} onPress={onPress} scaleTo={0.98}>
      <View style={local.aiBlob1} />
      <View style={local.aiBlob2} />
      <View style={{ flex: 1 }}>
        <Text style={local.aiTitle}>{t('home.aiBannerTitle')}</Text>
        <Text style={local.aiText}>{t('home.aiBannerText')}</Text>
        <View style={local.aiBtn}>
          <Text style={local.aiBtnText}>{t('home.aiBannerCta')}</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.INK} />
        </View>
      </View>
      <Animated.View style={[local.aiIcon, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }]}>
        <Ionicons name="sparkles" size={34} color={COLORS.INK} />
      </Animated.View>
    </PressableScale>
  )
}

function FadeIn({ delay, children }: { delay: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 360, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [v, delay])
  return <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>{children}</Animated.View>
}

const local = themed(() =>
  StyleSheet.create({
    sectionIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.YELLOW, alignItems: 'center', justifyContent: 'center' },
    place: { width: 172, backgroundColor: COLORS.CARD, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.BORDER },
    placeImg: { width: '100%', height: 118 },
    placeRating: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    placeRatingText: { fontSize: 11, fontFamily: 'Poppins_700Bold', color: '#003B7D' },
    rank: { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.YELLOW, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    rankText: { fontSize: 11, fontFamily: 'Poppins_800ExtraBold', color: COLORS.INK },
    placeName: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE, lineHeight: 18, minHeight: 36 },
    placeMeta: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: COLORS.TEXT_MUTED, marginTop: 4 },
    city: { width: 140, height: 170, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end', padding: 12 },
    cityShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 25, 60, 0.42)' },
    cityName: { fontSize: 16, fontFamily: 'Poppins_800ExtraBold', color: '#FFF' },
    cityCount: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.9)' },
    guide: { width: 150, alignItems: 'center', backgroundColor: COLORS.CARD, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: COLORS.BORDER },
    guideImg: { width: 74, height: 74, borderRadius: 37, marginBottom: 8 },
    guideName: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE },
    guideSpec: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: COLORS.TEXT_MUTED },
    guideRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    guideRating: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE },
    guidePrice: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: COLORS.TEXT_MUTED, marginLeft: 6 },
    ai: { marginTop: 26, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.PRIMARY, borderRadius: 28, padding: 20, overflow: 'hidden' },
    aiBlob1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,209,0,0.22)', top: -60, right: -40 },
    aiBlob2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(230,57,70,0.25)', bottom: -50, left: 90 },
    aiTitle: { fontSize: 18, fontFamily: 'Poppins_800ExtraBold', color: '#FFF' },
    aiText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.88)', marginTop: 4, lineHeight: 17 },
    aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: COLORS.YELLOW, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginTop: 12 },
    aiBtnText: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: COLORS.INK },
    aiIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.YELLOW, alignItems: 'center', justifyContent: 'center' },
  }),
)
