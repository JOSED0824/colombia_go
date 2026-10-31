import React, { useEffect, useState } from 'react'
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../lib/api'
import { fotoGuia } from '../lib/images'
import type { GuiaDto } from '../lib/types'

type Guia = {
  id: string
  name: string
  specialty: string
  place: string
  rating: string
  reviews: string
  price: string
  image: any
  tags: string[]
  featured: boolean
}

function toGuia(dto: GuiaDto): Guia {
  return {
    id: String(dto.id),
    name: dto.name,
    specialty: dto.specialty,
    place: dto.place,
    rating: Number(dto.rating).toFixed(1),
    reviews: String(dto.reviews),
    price: dto.price.match(/\$[\d.,]+/)?.[0] ?? dto.price, // la pantalla muestra "por hora" (traducido) aparte
    image: fotoGuia(dto.name, dto.image),
    tags: dto.languages,
    featured: dto.featured,
  }
}

export function GuidesScreen() {
  const { t, i18n } = useTranslation()
  const [guides, setGuides] = useState<Guia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiGet<GuiaDto[]>('/api/v1/guias')
      .then((dtos) => setGuides(dtos.map(toGuia)))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [i18n.language])

  if (loading) return <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 60 }} />
  if (error || guides.length === 0) {
    return (
      <Text style={{ textAlign: 'center', color: COLORS.TEXT_MUTED, marginTop: 60 }}>
        {error ? t('common.noConnection') : t('guides.empty')}
      </Text>
    )
  }

  const featured = guides.find((g) => g.featured) ?? guides[0]
  const others = guides.filter((g) => g.id !== featured.id)
  return (
    <View>
      <View style={styles.guidesHeader}>
        <View>
          <Text style={styles.guidesTitle}>{t('guides.title')}</Text>
          <View style={styles.flagLine}>
            <View style={[styles.flagColor, { backgroundColor: COLORS.YELLOW }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.BLUE }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.RED }]} />
          </View>
        </View>
        <Ionicons name="search-outline" size={24} color={COLORS.BLUE} />
      </View>

      <View style={styles.guideHeroCard}>
        <Image source={featured.image} style={styles.guideHeroImg} />
        <View style={styles.guideHeroContent}>
          <View style={styles.pillExp}>
            <Ionicons name="cafe" size={14} color="#5D4037" />
            <Text style={styles.pillExpText}>{featured.specialty}</Text>
          </View>
          <Text style={styles.guideHeroName}>{featured.name},</Text>
          <Text style={styles.guideHeroSub}>{featured.specialty}</Text>
          <View style={styles.guideHeroLoc}>
            <Ionicons name="location" size={16} color="#FFF" />
            <Text style={styles.guideHeroLocText}>{featured.place}</Text>
          </View>
          <View style={styles.ratingRowHero}>
            <Ionicons name="star" size={16} color={COLORS.YELLOW} />
            <Text style={styles.guideHeroRate}> {featured.rating} ({t('guides.reviews', { count: Number(featured.reviews) })})</Text>
          </View>
          <Pressable style={styles.reserveBtn}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.BLUE} />
            <Text style={styles.reserveBtnText}>{t('guides.reserve')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('guides.others')}</Text>
        <Pressable><Text style={styles.seeAllText}>{t('common.viewAll')}</Text></Pressable>
      </View>

      {others.map((item) => (
        <Pressable key={item.id} style={styles.guideRowCard}>
          <Image source={item.image} style={styles.guideRowImg} />
          <View style={styles.guideRowContent}>
            <Text style={styles.guideRowName}>{item.name}, {item.specialty}</Text>
            <View style={styles.guideRowPill}><Text style={styles.guideRowPillText}>{item.specialty}</Text></View>
            <View style={styles.langRow}>
              {item.tags.map(t => <Text key={t} style={styles.langTag}>{t}</Text>)}
            </View>
            <View style={styles.ratingRowSmall}>
              <Ionicons name="star" size={12} color={COLORS.YELLOW} />
              <Text style={styles.ratingValueSmall}>{item.rating} ({t('guides.reviews', { count: Number(item.reviews) })})</Text>
            </View>
          </View>
          <View style={styles.guidePriceArea}>
            <Text style={styles.guidePriceVal}>{item.price}</Text>
            <Text style={styles.guidePriceSub}>{t('guides.perHour')}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.BLUE} />
          </View>
        </Pressable>
      ))}
    </View>
  )
}
