import React, { useMemo } from 'react'
import { View, Image, Pressable, ActivityIndicator } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { useTranslation } from 'react-i18next'
import { useApi } from '../lib/useApi'
import { PressableScale } from '../components/Transitions'
import { toGuia, type Guia } from '../lib/guides'
import type { GuiaDto } from '../lib/types'

export function GuidesScreen({ onSelect }: { onSelect?: (guide: Guia) => void }) {
  const { t } = useTranslation()
  // Con caché: al volver a esta pestaña la lista aparece al instante, sin spinner ni nueva consulta.
  const { data, loading, error } = useApi<GuiaDto[]>('/api/v1/guias')
  const guides = useMemo(() => (data ?? []).map(toGuia), [data])

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

      <Pressable style={styles.guideHeroCard} onPress={() => onSelect?.(featured)}>
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
          <Pressable style={styles.reserveBtn} onPress={() => onSelect?.(featured)}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.INK} />
            <Text style={styles.reserveBtnText}>{t('guides.reserve')}</Text>
          </Pressable>
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { flexShrink: 1, marginRight: 12 }]} numberOfLines={2}>{t('guides.others')}</Text>
        <Pressable><Text style={styles.seeAllText}>{t('common.viewAll')}</Text></Pressable>
      </View>

      {others.map((item) => (
        <PressableScale key={item.id} style={styles.guideRowCard} onPress={() => onSelect?.(item)} scaleTo={0.97}>
          <Image source={item.image} style={styles.guideRowImg} />
          <View style={styles.guideRowContent}>
            <Text style={styles.guideRowName}>{item.name}, {item.specialty}</Text>
            <View style={styles.guideRowPill}><Text style={styles.guideRowPillText}>{item.specialty}</Text></View>
            <View style={styles.langRow}>
              {item.tags.map(t => <Text key={t} style={styles.langTag}>{t}</Text>)}
            </View>
            <View style={styles.ratingRowSmall}>
              <Ionicons name="star" size={12} color={COLORS.YELLOW} />
              <Text style={styles.ratingValueSmall} numberOfLines={1}>{item.rating} ({t('guides.reviews', { count: Number(item.reviews) })})</Text>
            </View>
          </View>
          <View style={styles.guidePriceArea}>
            <Text style={styles.guidePriceVal}>{item.price}</Text>
            <Text style={styles.guidePriceSub}>{t('guides.perHour')}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.BLUE} />
          </View>
        </PressableScale>
      ))}
    </View>
  )
}
